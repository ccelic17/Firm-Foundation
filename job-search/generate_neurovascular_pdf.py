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

html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>{CSS_STYLES}</style></head><body>

<div class="header">
  <h1>Collin Celic</h1>
  <div class="contact">
    ccelic17@gmail.com &nbsp;|&nbsp; (978) 512-2026 &nbsp;|&nbsp; linkedin.com/in/collin-celic<br>
    Relocating to Charlotte, NC &mdash; Available Immediately
  </div>
</div>

<div class="section-title">Professional Summary</div>
<div class="summary"><p>Results-driven B2B territory sales professional with 4+ years of field experience managing multimillion-dollar territories, delivering structured product in-services to professional audiences, and building trusted relationships with key decision-makers. Proven track record of exceeding quota, identifying high-value target accounts, and executing disciplined territory coverage with Salesforce CRM and Power BI. Seeking to launch a medical device sales career as an Associate Territory Manager with Stryker Neurovascular in Charlotte &mdash; a motivated, coachable performer ready to invest in the 12&ndash;24 month development path and compete for full Territory Manager.</p></div>

<div class="section-title">Core Competencies</div>
<table class="competencies-table">
  <tr>
    <td>B2B Territory Sales &amp; Account Management</td>
    <td>Target Account Identification &amp; Lead Generation</td>
    <td>Consultative / Solution Selling</td>
  </tr>
  <tr>
    <td>Product In-Services &amp; Stakeholder Education</td>
    <td>Salesforce CRM &amp; Power BI Analytics</td>
    <td>Quota Attainment &amp; Market Share Growth</td>
  </tr>
  <tr>
    <td>Full Sales Cycle &mdash; Discovery to Close</td>
    <td>Multi-Stakeholder Relationship Building</td>
    <td>Competitive Positioning &amp; New Business Development</td>
  </tr>
</table>

<div class="section-title">Professional Experience</div>

<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Territory Analysis &amp; Target Account Execution:</strong> Managed full B2B sales responsibility for a $5.47M annual portfolio across 23 accounts &mdash; conducted ongoing territory analysis using Salesforce CRM and Power BI to identify high-potential targets, prioritize field activity, and align outreach to revenue objectives.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026, demonstrating the closing discipline and executional focus Stryker expects from its Associate Territory Managers.</li>
    <li><strong>Competitive Market Share Growth:</strong> Grew market share across multiple key accounts during an industry-wide 8% market downturn &mdash; winning new business from entrenched competitor relationships through superior consultative engagement and consistent account presence.</li>
    <li><strong>Product In-Services &amp; Education:</strong> Delivered structured product education and in-location demonstrations across 23 accounts, training multi-level stakeholder teams &mdash; directly analogous to conducting clinical in-services for hospital staff and physicians on a Neurovascular device portfolio.</li>
    <li><strong>Lead Generation &amp; Follow-Through:</strong> Identified, qualified, and pursued high-value prospects through cold outreach, referral development, and trade presence &mdash; generating and following up on sales leads from first contact through close.</li>
  </ul>
</div>

<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue:</strong> Managed a $4.06M multi-brand territory across Milwaukee Tool, Ryobi, and Ridgid &mdash; achieving 5.15% YOY sales growth through disciplined daily outbound field activity and strategic account coverage.</li>
    <li><strong>In-Field Product Demonstrations:</strong> Conducted live product demonstrations and competitive comparisons for professional buyer audiences &mdash; persuading skeptical buyers through product expertise, performance evidence, and clear value communication.</li>
    <li><strong>New Account Development:</strong> Generated and followed up on new leads through daily in-person prospecting, relationship development with buyers, department managers, and decision-makers, growing revenue across the defined territory.</li>
    <li><strong>Executional Excellence:</strong> Maintained 100% planogram compliance and 90%+ completion rate on complex resets and new product launches &mdash; demonstrating the accountability and follow-through that Stryker&rsquo;s hospital-based sales environment demands.</li>
    <li><strong>Space &amp; Relationship Wins:</strong> Secured additional primary and off-aisle floor space by building trust and making a compelling business case &mdash; experience that maps directly to building access with hospital supply chain and clinical champions.</li>
  </ul>
</div>

<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Consistently exceeded monthly sales quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative, needs-based selling.</li>
    <li><strong>Objection Handling &amp; Closing:</strong> Developed strong skills navigating objections, sensitive conversations, and high-stakes decisions in a high-compliance, high-volume environment.</li>
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

path = "/home/user/Firm-Foundation/job-search/Collin_Celic_Resume_Stryker_Neurovascular.pdf"
HTML(string=html).write_pdf(path)
print(f"PDF written to: {path}")
