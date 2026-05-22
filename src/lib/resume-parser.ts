export interface ParsedResume {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  sections: {
    title: string;
    items: {
      title: string;
      sub1: string;
      sub2: string;
      date: string;
      bullets: string[];
    }[];
  }[];
}

export function parseLatex(latexCode: string): ParsedResume {
  // Strip out all LaTeX comments BEFORE processing to prevent commented out code from being parsed
  const latex = latexCode.replace(/(^|[^\\])%.*$/gm, '$1');

  const result: ParsedResume = {
    name: "Anonymous",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
    sections: []
  };

  // Name (Extract from center block's first line)
  const centerMatch = latex.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/);
  if (centerMatch) {
    const lines = centerMatch[1].split('\\\\');
    let rawName = lines[0].replace(/\\[a-zA-Z]+/g, '').replace(/[{}]/g, '').trim();
    if (rawName) result.name = rawName;
  }

  // Contact Info
  // The line usually looks like: \small 123-456-7890 $|$ \href{mailto:x@x.com}{\underline{jake@su.edu}}
  const phoneMatch = latex.match(/\\small\s+([0-9\-\+\(\)\s]+)\s+\$\|\$/);
  if (phoneMatch && phoneMatch[1]) result.phone = phoneMatch[1].trim();

  const emailMatch = latex.match(/\\href\{mailto:([^}]+)\}/);
  if (emailMatch) result.email = emailMatch[1].trim();

  const linkedInMatch = latex.match(/\\href\{https:\/\/(www\.)?linkedin\.com\/in\/([^}]+)\}/);
  if (linkedInMatch) result.linkedin = "linkedin.com/in/" + linkedInMatch[2].trim();

  const githubMatch = latex.match(/\\href\{https:\/\/(www\.)?github\.com\/([^}]+)\}/);
  if (githubMatch) result.github = "github.com/" + githubMatch[2].trim();

  // Sections
  const sectionRegex = /\\section\{([^}]+)\}([\s\S]*?)(?=\\section\{|$)/g;
  let secMatch;
  while ((secMatch = sectionRegex.exec(latex)) !== null) {
    const sectionTitle = secMatch[1].trim();
    const sectionBody = secMatch[2];
    const newSection = { title: sectionTitle, items: [] as any[] };

    if (sectionTitle.toLowerCase().includes("skills")) {
      // Skills
      const skillRegex = /\\textbf\{([^}]+)\}(?:\{:|:\{|:)\s*(.*?)(?=\\\\|\n|$)/g;
      let skillMatch;
      while ((skillMatch = skillRegex.exec(sectionBody)) !== null) {
        let val = skillMatch[2].replace(/\}\s*$/, '').trim();
        newSection.items.push({
          title: skillMatch[1].trim(),
          sub1: "", sub2: "", date: "",
          bullets: [`\\textbf{${skillMatch[1].trim()}}: ${val}`]
        });
      }
    } else {
      // Experience, Projects, Education
      // Match \resumeSubheading or \resumeProjectHeading blocks
      // Subheading format: \resumeSubheading{Title}{Location}{Role}{Date}
      const arg = `\\{((?:[^{}]|\\{[^{}]*\\})*)\\}`;
      const itemRegexStr = `\\\\resume(?:Subheading|ProjectHeading)\\s*${arg}\\s*${arg}(?:\\s*${arg}\\s*${arg})?([\\s\\S]*?)(?=\\\\resume(?:Subheading|ProjectHeading)|$)`;
      const itemRegex = new RegExp(itemRegexStr, 'g');
      let itemMatch;
      while ((itemMatch = itemRegex.exec(sectionBody)) !== null) {
        const t1 = itemMatch[1].trim();
        const t2 = itemMatch[2].trim();
        const t3 = itemMatch[3] ? itemMatch[3].trim() : "";
        const t4 = itemMatch[4] ? itemMatch[4].trim() : "";
        const itemBody = itemMatch[5] || "";

        const bullets: string[] = [];
        const bulletRegex = /\\resumeItem\{([\s\S]*?)(?=\}\s*(?:\\resumeItem|\\resumeItemListEnd))/g;
        let bMatch;
        while ((bMatch = bulletRegex.exec(itemBody)) !== null) {
          bullets.push(bMatch[1].trim());
        }
        
        // Single resumeItem fallback if regex missed something
        if (bullets.length === 0 && itemBody.includes("\\resumeItem{")) {
           const singleMatch = itemBody.match(/\\resumeItem\{([^}]+)\}/g);
           if (singleMatch) {
             singleMatch.forEach(m => {
               bullets.push(m.replace(/\\resumeItem\{|\}$/g, '').trim());
             });
           }
        }

        if (t3 && t4) {
          // It's a Subheading (4 args)
          newSection.items.push({ title: t1, sub2: t2, sub1: t3, date: t4, bullets });
        } else {
          // It's a ProjectHeading (2 args)
          newSection.items.push({
            title: t1,
            sub1: "", sub2: "", date: t2,
            bullets
          });
        }
      }

      // If no subheadings were found, it might be a plain text section like "Summary"
      if (newSection.items.length === 0 && sectionBody.trim()) {
        let plainText = sectionBody
          // remove common wrappers
          .replace(/\\begin\{adjustwidth\}[^}]*\}[^}]*\}/g, '')
          .replace(/\\end\{adjustwidth\}/g, '')
          .replace(/\\small/g, '')
          // remove other generic formatting that isn't bold/italic/href handled by ui
          .replace(/\\vspace\{[^}]+\}/g, '')
          .replace(/\\hspace\{[^}]+\}/g, '')
          .replace(/[\n\r]+/g, ' ')
          .trim();
          
        if (plainText) {
          newSection.items.push({
            title: "", sub1: "", sub2: "", date: "",
            bullets: [plainText]
          });
        }
      }
    }

    result.sections.push(newSection);
  }

  return result;
}
