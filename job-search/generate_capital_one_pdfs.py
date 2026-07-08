from weasyprint import HTML

CSS_STYLES = """
@page {
  margin: 0.65in 0.7in 0.65in 0.7in;
  size: letter;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Calibri', 'Arial', sans-serif;
  font-size: 10.5pt;
  color: #222;
  line-height: 1.35;
}
.header { text-align: center; margin-bottom: 10px; }
.header h1 {
  font-size: 22pt;
  font-weight: 700;
  letter-spacing: 2px;
  color: #1a1a1a;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.header .contact { font-size: 10pt; color: #444; }
.section-title {
  font-size: 10.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #1a6496;
  border-bottom: 1.5px solid #1a6496;
  padding-bottom: 2px;
  margin-top: 12px;
  margin-bottom: 6px;
}
.summary p { font-size: 10.5pt; line-height: 1.4; }
.competencies-table { width: 100%; border-collapse: collapse; }
.competencies-table td {
  font-size: 10pt;
  padding: 3px 6px;
  border: 1px solid #ccc;
  width: 33.33%;
  vertical-align: top;
}
.job { margin-bottom: 10px; }
.job-title { font-weight: 700; font-size: 10.5pt; color: #1a6496; }
.job-company { font-style: italic; font-size: 10pt; color: #555; margin-bottom: 4px; }
ul { margin-left: 14px; margin-top: 3px; }
ul li { font-size: 10.5pt; margin-bottom: 3px; line-height: 1.35; }
ul li strong { color: #1a1a1a; }
.edu-title { font-weight: 700; font-size: 10.5pt; }
.edu-detail { font-style: italic; font-size: 10pt; color: #555; }
.skills p { font-size: 10.5pt; margin-bottom: 3px; }
"""

# ── RESUME ──────────────────────────────────────────────────────────────────

resume_html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>{CSS_STYLES}</style></head><body>

<div class="header">
  <h1>Collin Celic</h1>
  <div class="contact">
    ccelic17@gmail.com &nbsp;|&nbsp; (978) 512-2026 &nbsp;|&nbsp; linkedin.com/in/collin-celic<br>
    Relocating to Charlotte, NC &mdash; Available Immediately
  </div>
</div>

<div class="section-title">Professional Summary</div>
<div class="summary"><p>Financial services and B2B territory sales professional with 4+ years of field experience managing multimillion-dollar territories and a direct background in automotive and consumer lending. At Digital Federal Credit Union, closed approximately 20 auto loans and 50 credit cards per month through consultative, needs-based selling &mdash; directly aligned with Capital One Auto Finance&rsquo;s dealer and consumer lending model. At KraftMaid and Techtronic Industries, managed 23+ retail partner accounts and drove product adoption through structured in-person presentations, stakeholder training, and data-driven monthly territory planning with Salesforce CRM. Seeking to bring a high-activity, relationship-first field sales approach to Capital One&rsquo;s Area Sales Manager role in the Carolina market.</p></div>

<div class="section-title">Core Competencies</div>
<table class="competencies-table">
  <tr>
    <td>B2B Territory Sales &amp; Dealer Engagement</td>
    <td>Financial Products &amp; Consumer Lending</td>
    <td>Consultative / Solution Selling</td>
  </tr>
  <tr>
    <td>Product Presentations &amp; Account Training</td>
    <td>Salesforce CRM &amp; Data-Driven Planning</td>
    <td>Quota Attainment &amp; Revenue Growth</td>
  </tr>
  <tr>
    <td>Full Sales Cycle &mdash; Discovery to Close</td>
    <td>Multi-Stakeholder Relationship Building</td>
    <td>New Business Development &amp; Prospecting</td>
  </tr>
</table>

<div class="section-title">Professional Experience</div>

<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Dealer-Model Account Management:</strong> Managed full B2B sales responsibility for a $5.47M annual portfolio across 23 retail partner accounts &mdash; mirroring Capital One&rsquo;s dealer engagement model through structured monthly planning, performance analysis, and consultative account visits to drive product adoption and revenue.</li>
    <li><strong>Product Adoption &amp; Training:</strong> Delivered structured product presentations and in-location training across 23 accounts, educating multi-level store teams on product positioning and sell-through strategies &mdash; directly analogous to conducting dealer training sessions on Capital One&rsquo;s lead-generation platform.</li>
    <li><strong>Quota Attainment:</strong> Achieved 145% of monthly sales quota in January 2026, demonstrating the closing discipline and executional focus Capital One expects from its Area Sales Managers.</li>
    <li><strong>Competitive Market Share Growth:</strong> Grew revenue share across multiple key accounts during an industry-wide 8% market downturn &mdash; winning against entrenched competitors through superior consultative engagement and consistent field presence.</li>
    <li><strong>Data-Driven Territory Planning:</strong> Used Salesforce CRM and Power BI dashboards to analyze account performance, prioritize high-value targets, and build monthly dealer engagement plans aligned to revenue objectives.</li>
  </ul>
</div>

<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue:</strong> Managed a $4.06M multi-brand territory across Milwaukee Tool, Ryobi, and Ridgid &mdash; driving 5.15% YOY sales growth through disciplined daily outbound field activity and strategic account coverage.</li>
    <li><strong>New Business Development:</strong> Generated and followed up on new leads through daily in-person prospecting and relationship development with buyers, department managers, and store leadership &mdash; growing incremental revenue across the defined territory.</li>
    <li><strong>Product Demonstrations &amp; Training:</strong> Conducted live product demonstrations, launch presentations, and competitive comparisons for professional audiences &mdash; persuading skeptical buyers through product knowledge, performance evidence, and clear value communication.</li>
    <li><strong>Executional Excellence:</strong> Maintained 100% planogram compliance and 90%+ completion rate on complex resets and new product launches &mdash; demonstrating the follow-through and reliability that build lasting partner trust.</li>
  </ul>
</div>

<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Auto &amp; Consumer Lending:</strong> Closed approximately 20 auto loans and 50 credit cards per month through consultative, needs-based selling &mdash; direct experience in the consumer lending and automotive financing products that define Capital One Auto Finance&rsquo;s business.</li>
    <li><strong>Quota Attainment:</strong> Consistently exceeded monthly sales quotas by 10% in a high-compliance, high-volume financial services environment.</li>
    <li><strong>Objection Handling &amp; Financial Conversations:</strong> Developed strong skills navigating sensitive financial conversations, overcoming objections, and closing complex decisions &mdash; directly applicable to guiding dealers and consumers through Capital One&rsquo;s lending and lead-gen product suite.</li>
  </ul>
</div>

<div class="section-title">Education</div>
<div class="edu-title">B.S. in Marketing &amp; Management (Dual Major) &mdash; University of Massachusetts Lowell</div>
<div class="edu-detail">Graduated August 2021</div>

<div class="section-title">Technical Skills &amp; Languages</div>
<div class="skills">
  <p><strong>Platforms:</strong> Salesforce CRM &nbsp;|&nbsp; Power BI &nbsp;|&nbsp; PEGA CRM &nbsp;|&nbsp; Microsoft Office Suite (Excel / PowerPoint) &nbsp;|&nbsp; Bloomberg Certified</p>
  <p><strong>Languages:</strong> English (Native) &nbsp;|&nbsp; Portuguese (Conversational) &nbsp;|&nbsp; Spanish (Intermediate)</p>
</div>

</body></html>"""

# ── COVER LETTER ─────────────────────────────────────────────────────────────

cover_html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
@page {{ margin: 1in 1in 1in 1in; size: letter; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{
  font-family: 'Calibri', 'Arial', sans-serif;
  font-size: 11pt;
  color: #222;
  line-height: 1.5;
}}
.sender {{ margin-bottom: 24px; }}
.sender .name {{
  font-size: 16pt;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 1px;
  text-transform: uppercase;
}}
.sender .contact {{ font-size: 10pt; color: #555; margin-top: 3px; }}
.date {{ margin-bottom: 20px; font-size: 10.5pt; color: #444; }}
.salutation {{ margin-bottom: 14px; font-size: 11pt; }}
.body p {{ font-size: 11pt; margin-bottom: 14px; line-height: 1.55; }}
.closing {{ margin-top: 28px; }}
.closing p {{ font-size: 11pt; margin-bottom: 3px; }}
.sig {{ margin-top: 18px; }}
.sig .name {{ font-weight: 700; font-size: 11pt; }}
.sig .contact {{ font-size: 10pt; color: #555; }}
</style>
</head><body>

<div class="sender">
  <div class="name">Collin Celic</div>
  <div class="contact">ccelic17@gmail.com &nbsp;|&nbsp; (978) 512-2026 &nbsp;|&nbsp; linkedin.com/in/collin-celic &nbsp;|&nbsp; Relocating to Charlotte, NC &mdash; Available Immediately</div>
</div>

<div class="salutation">Dear Capital One Hiring Team,</div>

<div class="body">
  <p>I&rsquo;m applying for the Area Sales Manager role on Capital One Auto Finance&rsquo;s dealer sales team. What makes this opportunity stand out isn&rsquo;t just the title &mdash; it&rsquo;s the specific model: a defined set of dealer relationships, a consultative engagement approach, and a product suite that drives measurable dealer performance. I&rsquo;ve spent the last four years doing exactly that kind of work, and I bring one additional credential most B2B sales candidates don&rsquo;t: direct experience closing auto loans and consumer financial products at Digital Federal Credit Union, where I averaged approximately 20 auto loans and 50 credit cards closed per month through consultative, needs-based selling.</p>

  <p>At KraftMaid Cabinetry, I managed a $5.47M annual portfolio across 23 retail partner accounts using a dealer-engagement model that maps directly to Capital One&rsquo;s Area Sales Manager role &mdash; structured monthly planning based on CRM analytics, in-person product training for multi-level store teams, and consistent field presence to drive adoption and revenue growth. I achieved 145% of monthly quota in January 2026 and grew market share in multiple key accounts during an industry-wide 8% market downturn by staying closer to my accounts and delivering more value than the incumbent. At Techtronic Industries, I drove 5.15% YOY growth across a $4.06M multi-brand territory through daily outbound field activity, persuasive product demonstrations, and disciplined new business prospecting &mdash; the same high-activity, results-focused approach Capital One&rsquo;s ASM role demands.</p>

  <p>I&rsquo;m relocating to the Carolina market immediately and available to start on your timeline. The combination of my financial services lending background, B2B field territory track record, and Salesforce CRM proficiency positions me to contribute quickly &mdash; not in six months, but in week one. I&rsquo;d welcome a 15-minute conversation to talk through the territory and how my background translates. My resume and cover letter are attached.</p>
</div>

<div class="closing">
  <p>Best regards,</p>
  <div class="sig">
    <div class="name">Collin Celic</div>
    <div class="contact">(978) 512-2026 &nbsp;|&nbsp; ccelic17@gmail.com &nbsp;|&nbsp; linkedin.com/in/collin-celic</div>
  </div>
</div>

</body></html>"""

resume_path = "/home/user/Firm-Foundation/job-search/Collin_Celic_Resume_Capital_One.pdf"
cover_path = "/home/user/Firm-Foundation/job-search/Collin_Celic_CoverLetter_Capital_One.pdf"

HTML(string=resume_html).write_pdf(resume_path)
print(f"Resume written: {resume_path}")

HTML(string=cover_html).write_pdf(cover_path)
print(f"Cover letter written: {cover_path}")
