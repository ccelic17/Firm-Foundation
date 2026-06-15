from weasyprint import HTML, CSS
import sys

html_content = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
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

  /* Header */
  .header {
    text-align: center;
    margin-bottom: 10px;
  }
  .header h1 {
    font-size: 22pt;
    font-weight: 700;
    letter-spacing: 2px;
    color: #1a1a1a;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .header .contact {
    font-size: 10pt;
    color: #444;
  }
  .header .contact a {
    color: #444;
    text-decoration: none;
  }

  /* Section divider */
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

  /* Summary */
  .summary p {
    font-size: 10.5pt;
    line-height: 1.4;
  }

  /* Competencies grid */
  .competencies-table {
    width: 100%;
    border-collapse: collapse;
  }
  .competencies-table td {
    font-size: 10pt;
    padding: 3px 6px;
    border: 1px solid #ccc;
    width: 33.33%;
    vertical-align: top;
  }

  /* Experience */
  .job {
    margin-bottom: 10px;
  }
  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .job-title {
    font-weight: 700;
    font-size: 10.5pt;
    color: #1a6496;
  }
  .job-company {
    font-style: italic;
    font-size: 10pt;
    color: #555;
    margin-bottom: 4px;
  }
  ul {
    margin-left: 14px;
    margin-top: 3px;
  }
  ul li {
    font-size: 10.5pt;
    margin-bottom: 3px;
    line-height: 1.35;
  }
  ul li strong {
    color: #1a1a1a;
  }

  /* Education */
  .edu-title {
    font-weight: 700;
    font-size: 10.5pt;
  }
  .edu-detail {
    font-style: italic;
    font-size: 10pt;
    color: #555;
  }

  /* Skills */
  .skills p {
    font-size: 10.5pt;
    margin-bottom: 3px;
  }
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <h1>Collin Celic</h1>
  <div class="contact">
    ccelic17@gmail.com &nbsp;|&nbsp; (978) 512-2026 &nbsp;|&nbsp; linkedin.com/in/collin-celic<br>
    Relocating to Raleigh, NC &mdash; Available Immediately
  </div>
</div>

<!-- SUMMARY -->
<div class="section-title">Professional Summary</div>
<div class="summary">
  <p>Results-driven B2B outside sales professional with 4+ years of field experience managing multimillion-dollar territories through consultative selling, persuasive product demonstrations, and disciplined new account acquisition. Proven track record of exceeding quota, growing market share in competitive environments, and earning trusted advisor status with key decision-makers. Seeking to bring a high-activity, customer-first field sales approach to Stryker&rsquo;s Surgical Technologies division &mdash; where B2B territory management excellence and a coachable, competitive mindset are the entry point.</p>
</div>

<!-- COMPETENCIES -->
<div class="section-title">Core Competencies</div>
<table class="competencies-table">
  <tr>
    <td>B2B Field Sales &amp; Territory Management</td>
    <td>New Business Prospecting &amp; Pipeline Development</td>
    <td>Consultative / Solution Selling</td>
  </tr>
  <tr>
    <td>Persuasive Product Demonstrations</td>
    <td>Quota Attainment &amp; Sales Execution</td>
    <td>Multi-Stakeholder Relationship Building</td>
  </tr>
  <tr>
    <td>Salesforce CRM &amp; Power BI Reporting</td>
    <td>Competitive Market Share Growth</td>
    <td>Full Sales Cycle &mdash; Discovery to Close</td>
  </tr>
</table>

<!-- EXPERIENCE -->
<div class="section-title">Professional Experience</div>

<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Territory Ownership:</strong> Managed full sales responsibility for a $5.47M annual portfolio across 23 high-volume retail locations in the greater Boston market &mdash; owning the account base, the pipeline, and the results.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026, demonstrating strong closing execution and product presentation discipline when fully ramped.</li>
    <li><strong>Competitive Market Share Growth:</strong> Grew market share across multiple key accounts during an industry-wide 8% market downturn &mdash; winning against incumbents through superior consultative engagement and account partnership.</li>
    <li><strong>Product Education &amp; Demonstration:</strong> Delivered structured product education and in-location demonstrations across 23 accounts, converting store-level associates into confident brand advocates and improving sell-through at the consumer level.</li>
    <li><strong>Data-Driven Territory Planning:</strong> Used Salesforce CRM and Power BI dashboards to manage account activity, prioritize high-value targets, optimize field routing, and forecast territory performance for management review.</li>
  </ul>
</div>

<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue:</strong> Managed a $4.06M multi-brand territory across Milwaukee Tool, Ryobi, and Ridgid product lines &mdash; driving 5.15% YOY revenue growth through disciplined daily outbound activity.</li>
    <li><strong>Face-to-Face New Business Development:</strong> Grew incremental revenue through daily in-person prospecting, relationship development with buyers, department managers, and store leadership across a defined field territory.</li>
    <li><strong>In-Field Product Demonstrations:</strong> Conducted product demonstrations, launch presentations, and competitive comparisons in retail and contractor-facing environments &mdash; persuading professional buyers on product performance and value.</li>
    <li><strong>Executional Excellence:</strong> Maintained 100% planogram compliance and a 90%+ completion rate on complex resets and new product launches &mdash; demonstrating the follow-through and reliability that build lasting account trust.</li>
    <li><strong>Space Acquisition:</strong> Secured additional primary and off-aisle floor space for brand displays, increasing account-level visibility and driving incremental purchase volume.</li>
  </ul>
</div>

<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Consistently exceeded monthly sales quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative, needs-based selling.</li>
    <li><strong>Objection Handling &amp; Negotiation:</strong> Developed strong skills in overcoming objections, navigating complex financial conversations, and closing in a high-compliance, high-volume environment.</li>
  </ul>
</div>

<!-- EDUCATION -->
<div class="section-title">Education</div>
<div class="edu-title">B.S. in Marketing &amp; Management (Dual Major) &mdash; University of Massachusetts Lowell</div>
<div class="edu-detail">Graduated August 2021</div>

<!-- SKILLS -->
<div class="section-title">Technical Skills &amp; Languages</div>
<div class="skills">
  <p><strong>Platforms:</strong> Salesforce CRM &nbsp;|&nbsp; Power BI &nbsp;|&nbsp; PEGA CRM &nbsp;|&nbsp; Microsoft Office Suite (Excel / PowerPoint) &nbsp;|&nbsp; Bloomberg Certified</p>
  <p><strong>Languages:</strong> English (Native) &nbsp;|&nbsp; Portuguese (Conversational) &nbsp;|&nbsp; Spanish (Intermediate)</p>
</div>

</body>
</html>
"""

output_path = "/home/user/Firm-Foundation/job-search/Collin_Celic_Resume_Stryker.pdf"
HTML(string=html_content).write_pdf(output_path)
print(f"PDF written to: {output_path}")
