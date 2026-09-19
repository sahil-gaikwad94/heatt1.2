import React from 'react';
import { View, Image, Linking, StyleSheet } from 'react-native';
import { ThemedText } from './Text';
import { useTheme } from '../theme/ThemeProvider';

/**
 * A small, dependency-free Markdown renderer for article bodies. Supports:
 * headings, paragraphs, bold/italic, inline links, blockquotes, unordered/ordered
 * lists, images, and horizontal rules. Content is hosted in-app (rights owned) —
 * links inside a body are optional and never a redirect out of the reader.
 */

type InlineToken = { text: string; bold?: boolean; italic?: boolean; href?: string };

function parseInline(raw: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let i = 0;
  const pushText = (text: string, base: Partial<InlineToken> = {}) => {
    // handle bold/italic within a plain segment
    const re = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (m.index > last) tokens.push({ text: text.slice(last, m.index), ...base });
      if (m[2] !== undefined) tokens.push({ text: m[2], bold: true, ...base });
      else if (m[4] !== undefined) tokens.push({ text: m[4], italic: true, ...base });
      last = m.index + m[0].length;
    }
    if (last < text.length) tokens.push({ text: text.slice(last), ...base });
  };

  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let lm: RegExpExecArray | null;
  while ((lm = linkRe.exec(raw))) {
    if (lm.index > last) pushText(raw.slice(last, lm.index));
    pushText(lm[1], { href: lm[2] });
    last = lm.index + lm[0].length;
  }
  if (last < raw.length) pushText(raw.slice(last));
  return tokens;
}

function InlineText({ raw, size, lineHeight, family, color }: { raw: string; size: number; lineHeight: number; family?: string; color: string }) {
  const t = useTheme();
  const tokens = parseInline(raw);
  return (
    <ThemedText style={{ fontSize: size, lineHeight, color, fontFamily: family }}>
      {tokens.map((tok, i) => (
        <ThemedText
          key={i}
          onPress={tok.href ? () => Linking.openURL(tok.href!).catch(() => {}) : undefined}
          style={{
            fontSize: size,
            lineHeight,
            fontFamily: family,
            fontWeight: tok.bold ? '700' : '400',
            fontStyle: tok.italic ? 'italic' : 'normal',
            color: tok.href ? t.accent : color,
            textDecorationLine: tok.href ? 'underline' : 'none',
          }}
        >
          {tok.text}
        </ThemedText>
      ))}
    </ThemedText>
  );
}

export function Markdown({ source, fontSize = 18, serif = false }: { source: string; fontSize?: number; serif?: boolean }) {
  const t = useTheme();
  const family = serif ? t.fontRead : undefined;
  const lineHeight = fontSize * 1.6;
  const blocks = source.replace(/\r\n/g, '\n').split(/\n{2,}/);

  return (
    <View>
      {blocks.map((block, idx) => {
        const b = block.trim();
        if (!b) return null;

        // image
        const img = b.match(/^!\[[^\]]*\]\(([^)]+)\)$/);
        if (img) {
          return (
            <Image
              key={idx}
              source={{ uri: img[1] }}
              style={styles.img}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          );
        }

        // horizontal rule
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(b)) {
          return <View key={idx} style={[styles.hr, { backgroundColor: t.border }]} />;
        }

        // headings
        const h = b.match(/^(#{1,4})\s+(.*)$/);
        if (h) {
          const level = h[1].length;
          const s = level === 1 ? fontSize + 12 : level === 2 ? fontSize + 7 : fontSize + 3;
          return (
            <ThemedText key={idx} serif style={{ fontSize: s, lineHeight: s * 1.25, fontWeight: '800', marginTop: 22, marginBottom: 8, color: t.text }}>
              {h[2].replace(/[*_]/g, '')}
            </ThemedText>
          );
        }

        // blockquote
        if (b.startsWith('>')) {
          const quote = b.split('\n').map((l) => l.replace(/^>\s?/, '')).join('\n');
          return (
            <View key={idx} style={[styles.quote, { borderLeftColor: t.accent, backgroundColor: t.surface2 }]}>
              <InlineText raw={quote} size={fontSize} lineHeight={lineHeight} family={t.fontRead} color={t.text2} />
            </View>
          );
        }

        // unordered list
        if (/^\s*([-*+])\s+/.test(b)) {
          const items = b.split('\n').filter((l) => /^\s*([-*+])\s+/.test(l));
          return (
            <View key={idx} style={{ marginVertical: 8, gap: 6 }}>
              {items.map((it, i) => (
                <View key={i} style={styles.li}>
                  <ThemedText style={{ color: t.accent, fontSize, lineHeight }}>•</ThemedText>
                  <View style={{ flex: 1 }}>
                    <InlineText raw={it.replace(/^\s*([-*+])\s+/, '')} size={fontSize} lineHeight={lineHeight} family={family} color={t.text} />
                  </View>
                </View>
              ))}
            </View>
          );
        }

        // ordered list
        if (/^\s*\d+\.\s+/.test(b)) {
          const items = b.split('\n').filter((l) => /^\s*\d+\.\s+/.test(l));
          return (
            <View key={idx} style={{ marginVertical: 8, gap: 6 }}>
              {items.map((it, i) => (
                <View key={i} style={styles.li}>
                  <ThemedText style={{ color: t.accent, fontSize, lineHeight, fontWeight: '700' }}>{i + 1}.</ThemedText>
                  <View style={{ flex: 1 }}>
                    <InlineText raw={it.replace(/^\s*\d+\.\s+/, '')} size={fontSize} lineHeight={lineHeight} family={family} color={t.text} />
                  </View>
                </View>
              ))}
            </View>
          );
        }

        // paragraph
        return (
          <View key={idx} style={{ marginBottom: 16 }}>
            <InlineText raw={b.replace(/\n/g, ' ')} size={fontSize} lineHeight={lineHeight} family={family} color={t.text} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  img: { width: '100%', height: 200, borderRadius: 14, marginVertical: 12, backgroundColor: 'rgba(0,0,0,0.05)' },
  hr: { height: StyleSheet.hairlineWidth, marginVertical: 20 },
  quote: { borderLeftWidth: 3, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginVertical: 12 },
  li: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
});
