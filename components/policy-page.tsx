import { readFileSync } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import PolicyBackButton from "./policy-back-button";
import styles from "./policy-page.module.css";

type Country = "India" | "Pakistan";
type Kind = "Privacy Policy" | "Terms and Conditions";

const files: Record<Country, Record<Kind, string>> = {
  India: { "Privacy Policy": "india-privacy.md", "Terms and Conditions": "india-terms.md" },
  Pakistan: { "Privacy Policy": "pakistan-privacy.md", "Terms and Conditions": "pakistan-terms.md" },
};
const email = "joinroktokorobinetwork@gmail.com";

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)]+)\)|joinroktokorobinetwork@gmail\.com/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(text.slice(cursor, index));
    if (match[1] && match[2]) {
      parts.push(<a key={index} href={match[2]} {...(match[2].startsWith("https://") ? { rel: "noopener noreferrer", target: "_blank" } : {})}>{match[1]}</a>);
    } else {
      parts.push(<a key={index} href={`mailto:${email}`}>{email}</a>);
    }
    cursor = index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function sectionId(heading: string): string {
  return `section-${heading.match(/^\d+/)?.[0] ?? heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function renderBody(lines: string[]): ReactNode[] {
  const blocks: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index++; continue; }
    if (line.startsWith("## ")) {
      const heading = line.slice(3);
      const article = heading.match(/^(\d+)\.\s*(.+)$/);
      blocks.push(<h2 id={sectionId(heading)} key={index} className={styles.articleHeading}>
        {article ? <><span className={styles.articleNumber}>Article {article[1]}</span><span>{article[2]}</span></> : heading}
      </h2>);
      index++;
      continue;
    }
    if (line.startsWith("| ")) {
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("| ")) {
        const cells = lines[index].trim().slice(1, -1).split("|").map((cell) => cell.trim());
        if (!cells.every((cell) => /^-+$/.test(cell))) rows.push(cells);
        index++;
      }
      const [head, ...body] = rows;
      blocks.push(<div className={styles.tableWrap} key={`table-${index}`}><table><thead><tr>{head.map((cell, cellIndex) => <th scope="col" key={cellIndex}>{cell}</th>)}</tr></thead><tbody>{body.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{inline(cell)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index++;
      }
      blocks.push(<ul key={`list-${index}`}>{items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}</ul>);
      continue;
    }
    if (line.startsWith("[")) {
      blocks.push(<aside className={styles.reviewNote} key={index}>{inline(line)}</aside>);
      index++;
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^(## |\| |- |\[)/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index++;
    }
    blocks.push(<p key={`paragraph-${index}`}>{inline(paragraph.join(" "))}</p>);
  }
  return blocks;
}

export default function PolicyPage({ country, kind }: { country: Country; kind: Kind }) {
  const source = readFileSync(path.join(process.cwd(), "docs", files[country][kind]), "utf8");
  const marker = `# ${country} ${kind}`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Missing ${country} ${kind} policy`);
  const document = source.slice(start + marker.length).trim();
  const lines = document.split(/\r?\n/);
  const version = lines.find((line) => line.startsWith("Version:"))?.replace("Version:", "").trim();
  const headings = lines.filter((line) => line.startsWith("## ")).map((line) => line.slice(3));
  const prepared = lines.find((line) => line.startsWith("Prepared:"))?.replace("Prepared:", "").trim();
  const effective = lines.find((line) => line.startsWith("Effective date:"))?.replace("Effective date:", "").trim();

  return <main className={styles.page}>
    <PolicyBackButton />
    <header className={styles.hero}>
      <div className={styles.brand}>RoktoKorobi</div>
      <p className={styles.tagline}>Blood Donation Platform — {country}</p>
      <div className={styles.heroRule} />
      <h1>{kind === "Privacy Policy" ? "Privacy Policy & Data Protection Regulations" : "Terms of Service & Conditions of Use"}</h1>
      <p className={styles.heroVersion}>{version} · Effective {effective}</p>
    </header>
    <div className={styles.documentWrap}>
      <div className={styles.preamble}>
        <p><strong>Effective date: {effective}.</strong> Prepared {prepared}. This is the English-language {kind.toLowerCase()} for the {country} service.</p>
        <p><a href={country === "India" ? "/india/terms" : "/pakistan/terms"}>Terms</a> · <a href={country === "India" ? "/india/privacy" : "/pakistan/privacy"}>Privacy</a> · <a href="/partner-account">Partner leader signup</a></p>
      </div>
      <nav className={styles.toc} aria-label="On this page">
        <h2>Contents</h2>
        <ol>{headings.map((heading) => <li key={heading}><a href={`#${sectionId(heading)}`}>{heading}</a></li>)}</ol>
      </nav>
      <article className={styles.document}>{renderBody(lines.filter((line) => !/^(Version:|Prepared:|Effective date:)/.test(line)))}</article>
    </div>
    <footer className={styles.footer}>RoktoKorobi · {country} · Contact: <a href={`mailto:${email}`}>{email}</a>.</footer>
  </main>;
}
