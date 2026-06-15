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

HEADER = """
<div class="header">
  <h1>Collin Celic</h1>
  <div class="contact">
    ccelic17@gmail.com &nbsp;|&nbsp; (978) 512-2026 &nbsp;|&nbsp; linkedin.com/in/collin-celic<br>
    {location}
  </div>
</div>
"""

COMPETENCIES_GENERIC = [
  ("B2B Field Sales &amp; Territory Management", "New Business Prospecting &amp; Pipeline Development", "Consultative / Solution Selling"),
  ("CRM &amp; Data-Driven Territory Planning", "Full Sales Cycle &mdash; Discovery to Close", "Account Relationship Management"),
  ("Salesforce &amp; Power BI Reporting", "Product Education &amp; Stakeholder Training", "Market Share Growth in Declining Markets"),
]

DCU_BULLETS = """
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Consistently exceeded monthly sales quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative, needs-based selling.</li>
    <li><strong>Objection Handling &amp; Negotiation:</strong> Developed strong skills in overcoming objections, navigating complex financial conversations, and closing in a high-compliance, high-volume environment.</li>
  </ul>
</div>
"""

EDUCATION = """
<div class="section-title">Education</div>
<div class="edu-title">B.S. in Marketing &amp; Management (Dual Major) &mdash; University of Massachusetts Lowell</div>
<div class="edu-detail">Graduated August 2021</div>
"""

SKILLS = """
<div class="section-title">Technical Skills &amp; Languages</div>
<div class="skills">
  <p><strong>Platforms:</strong> Salesforce CRM &nbsp;|&nbsp; Power BI &nbsp;|&nbsp; PEGA CRM &nbsp;|&nbsp; Microsoft Office Suite (Excel / PowerPoint) &nbsp;|&nbsp; Bloomberg Certified</p>
  <p><strong>Languages:</strong> English (Native) &nbsp;|&nbsp; Portuguese (Conversational) &nbsp;|&nbsp; Spanish (Intermediate)</p>
</div>
"""

def competency_table(rows):
    html = '<table class="competencies-table">'
    for r in rows:
        html += "<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>"
    html += "</table>"
    return html

def wrap(body, location="Relocating to Charlotte / Raleigh, NC &mdash; Available Immediately"):
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>{CSS_STYLES}</style></head><body>
{HEADER.format(location=location)}
{body}
{EDUCATION}
{SKILLS}
</body></html>"""

def make_pdf(html, filename):
    path = f"/home/user/Firm-Foundation/job-search/{filename}"
    HTML(string=html).write_pdf(path)
    print(f"  ✓ {filename}")
    return path

# ─────────────────────────────────────────────
# 1. GENERIC SALES
# ─────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Results-driven B2B Territory Sales Manager with 4+ years of field experience managing multimillion-dollar territories through consultative, relationship-based selling. Proven ability to grow market share in competitive and declining markets, build strategic account partnerships, and execute disciplined face-to-face prospecting activity. Experienced in full-cycle territory management &mdash; from cold prospecting and pipeline development through close, account reviews, and long-term retention. Proficient in Salesforce CRM and Power BI. Actively relocating to Charlotte/Raleigh, NC &mdash; seeking a high-growth field sales role with strong base + commission upside and a clear path to territory ownership and leadership.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table(COMPETENCIES_GENERIC)}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Territory Ownership:</strong> Held full sales responsibility for a $5.47M annual portfolio spanning 23 high-volume accounts across the greater Boston market &mdash; accountable for revenue performance, account health, and competitive positioning.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026, demonstrating strong execution and closing discipline when fully ramped.</li>
    <li><strong>Market Share Growth:</strong> Grew market share across multiple key accounts during an industry-wide 8% market downturn through strategic account prioritization and consultative partnership with dealer principals and buyers.</li>
    <li><strong>Data-Driven Territory Planning:</strong> Leveraged Power BI dashboards and Salesforce CRM to track KPIs, optimize call routing, and identify high-potential accounts for targeted outreach.</li>
    <li><strong>Product Education &amp; Stakeholder Training:</strong> Delivered ongoing product education across 23 locations, converting account-level associates into brand advocates and improving end-consumer sell-through.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue:</strong> Managed a $4.06M multi-brand territory for Milwaukee Tool, Ryobi, and Ridgid &mdash; achieving 5.15% YOY sales growth through disciplined outbound field engagement.</li>
    <li><strong>Face-to-Face Prospecting:</strong> Drove new business and incremental revenue through daily in-person field activity, building relationships with buyers, department managers, and store leadership.</li>
    <li><strong>Product Demonstrations:</strong> Conducted live product demonstrations and competitive comparisons for professional buyer audiences &mdash; persuading brand switches through performance-based selling.</li>
    <li><strong>Space &amp; Account Wins:</strong> Secured additional floor space and secondary displays by building compelling business cases and earning account trust through consistent service and reliability.</li>
    <li><strong>Executional Excellence:</strong> Maintained 100% planogram compliance and 90%+ completion rate on complex merchandising resets and new product launches across all accounts.</li>
  </ul>
</div>
{DCU_BULLETS}
"""
make_pdf(wrap(body), "Collin_Celic_Resume_Generic_Sales.pdf")

# ─────────────────────────────────────────────
# 2. INSULET
# ─────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Strategic B2B territory sales professional with 4+ years of field experience managing multimillion-dollar territories through data-driven planning, consultative selling, and long-term relationship development. Proven ability to build and execute territory business strategies, exceed quota in competitive and declining markets, and leverage Salesforce to maintain account intelligence and forecast performance. Motivated to channel a high-performance B2B sales track record into a mission-driven role at Insulet &mdash; bringing disciplined territory ownership to the Omnipod business in Raleigh West.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
  ("Territory Business Strategy &amp; Planning", "Consultative / Solution Selling", "New Business Development &amp; Account Acquisition"),
  ("Salesforce CRM &amp; Power BI Analytics", "Key Account Relationship Management", "Competitive Positioning &amp; Market Share Growth"),
  ("Business Reviews &amp; Stakeholder Presentations", "Full Sales Cycle &mdash; Discovery to Close", "Field-Based Territory Execution"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Territory Strategy &amp; Execution:</strong> Developed and executed a data-driven territory business plan for a $5.47M annual portfolio across 23 accounts &mdash; balancing existing account growth with targeted new business acquisition, and aligning weekly field activity to quarterly revenue goals.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026 &mdash; delivering measurable results through disciplined execution and consultative partnership with dealer principals and store leadership.</li>
    <li><strong>Market Share Growth in Declining Market:</strong> Grew market share across multiple key accounts during an industry-wide 8% market downturn by deepening customer relationships, identifying unmet needs, and differentiating through service quality.</li>
    <li><strong>CRM-Driven Territory Management:</strong> Leveraged Salesforce CRM and Power BI dashboards to track account-level KPIs, manage pipeline visibility, optimize field routing, and produce performance forecasts for regional management.</li>
    <li><strong>Stakeholder Education &amp; Partnership:</strong> Delivered structured product education and business reviews across 23 locations &mdash; positioning as a trusted advisor to owner-operators, buyers, and floor-level teams to drive long-term brand loyalty and revenue growth.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue Growth:</strong> Managed a $4.06M multi-brand territory (Milwaukee Tool, Ryobi, Ridgid) &mdash; achieving 5.15% YOY revenue growth through disciplined field engagement and strategic account prioritization.</li>
    <li><strong>Relationship-Based Prospecting:</strong> Built trusted relationships with buyers, department managers, and store leadership through consistent in-person presence, proactive communication, and a solutions-first approach.</li>
    <li><strong>Consultative Presentations:</strong> Conducted product presentations, competitive comparisons, and launch briefings to professional buyer audiences &mdash; adapting messaging to each stakeholder's business priorities.</li>
    <li><strong>Executional Discipline:</strong> Maintained 100% planogram compliance and 90%+ completion rate on complex resets and new product launches &mdash; demonstrating the accountability that sustains long-term account trust.</li>
  </ul>
</div>
{DCU_BULLETS}
"""
make_pdf(wrap(body, "Relocating to Raleigh, NC &mdash; Available Immediately"), "Collin_Celic_Resume_Insulet.pdf")

# ─────────────────────────────────────────────
# 3. CINTAS
# ─────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>High-activity B2B field sales professional with 4+ years of territory management and new business development experience. Thrives in prospecting-first environments where income is earned through daily field presence, cold outreach, and competitive new account acquisition. Proven record of exceeding quota in multimillion-dollar territories, building lasting account relationships, and executing disciplined pipeline activity with Salesforce CRM. Relocating to Charlotte immediately &mdash; ready to own a territory and produce results from day one.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
  ("B2B Outside Field Sales", "Cold Calling &amp; New Business Prospecting", "Territory Development &amp; Account Acquisition"),
  ("Full Sales Cycle &mdash; Discovery to Close", "Pipeline Management &amp; CRM (Salesforce)", "Quota Attainment &amp; Performance Execution"),
  ("Consultative / Value-Based Selling", "Objection Handling &amp; Competitive Closing", "Account Retention &amp; Growth"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Territory Ownership:</strong> Held full B2B sales responsibility for a $5.47M annual portfolio spanning 23 high-volume accounts across the greater Boston market &mdash; responsible for every dollar in the territory.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026 through disciplined field execution, targeted account prioritization, and competitive closing activity.</li>
    <li><strong>New Business &amp; Market Share Growth:</strong> Grew market share across multiple accounts during an industry-wide 8% market downturn &mdash; displacing competitors and winning incremental business through consistent presence and consultative partnership.</li>
    <li><strong>Salesforce &amp; Pipeline Discipline:</strong> Used Salesforce CRM and Power BI dashboards daily to track account activity, manage the prospect pipeline, and route field time toward highest-opportunity targets.</li>
    <li><strong>Product Training:</strong> Delivered product education across 23 accounts, converting stakeholders into engaged advocates &mdash; reflecting the same skill set used to demonstrate value in a Cintas territory.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue:</strong> Managed a $4.06M multi-brand territory (Milwaukee Tool, Ryobi, Ridgid) &mdash; growing revenue 5.15% YOY through daily cold prospecting and account relationship development.</li>
    <li><strong>Daily Field Prospecting:</strong> Generated new business and incremental revenue through high-frequency in-person cold calls to buyers, managers, and decision-makers across a defined geography.</li>
    <li><strong>Competitive Account Wins:</strong> Secured additional floor space and off-aisle displays by building a compelling business case and outperforming incumbent vendor relationships.</li>
    <li><strong>Executional Reliability:</strong> Maintained 100% planogram compliance and 90%+ completion rate on resets and product launches &mdash; demonstrating the consistency that builds trust with busy account contacts.</li>
  </ul>
</div>
{DCU_BULLETS}
"""
make_pdf(wrap(body, "Relocating to Charlotte, NC &mdash; Available Immediately"), "Collin_Celic_Resume_Cintas.pdf")

# ─────────────────────────────────────────────
# 4. CARDINAL HEALTH
# ─────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Consultative B2B territory sales professional with 4+ years of field experience managing multimillion-dollar account portfolios, growing revenue in competitive markets, and building trusted advisor relationships with business owners and key decision-makers. Skilled in Salesforce-driven territory planning, contract-oriented account management, and product education at scale. Actively relocating to Raleigh, NC and seeking a territory sales role with Cardinal Health &mdash; where a proven ability to develop accounts and manage complex multi-stakeholder relationships creates immediate impact.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
  ("B2B Territory Sales &amp; Account Management", "New Business Prospecting &amp; Pipeline Development", "Consultative / Solution Selling"),
  ("Salesforce CRM &amp; Power BI Analytics", "Contract Management &amp; Pricing Discussions", "Product Education &amp; Stakeholder Training"),
  ("Market Share Growth in Competitive Markets", "Multi-Stakeholder Relationship Building", "Full Sales Cycle &mdash; Discovery to Close"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Territory Management:</strong> Held full sales accountability for a $5.47M annual portfolio spanning 23 accounts &mdash; managing pricing, service escalations, account health, and revenue growth in a defined geography.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026 through strategic account prioritization, consistent consultative engagement, and disciplined pipeline management.</li>
    <li><strong>Competitive Market Share Growth:</strong> Grew market share in multiple key accounts during an industry-wide 8% market downturn &mdash; protecting and growing revenue through superior service and differentiated value.</li>
    <li><strong>Product Education &amp; Training:</strong> Delivered structured product education programs across 23 accounts, training stakeholders on product features, competitive differentiation, and end-user application &mdash; strengthening account loyalty and reducing competitive vulnerability.</li>
    <li><strong>CRM &amp; Data-Driven Planning:</strong> Leveraged Salesforce CRM and Power BI dashboards to track KPIs, manage call routing, monitor account trends, and produce territory forecasts for regional leadership.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue:</strong> Managed a $4.06M multi-brand territory for Milwaukee Tool, Ryobi, and Ridgid &mdash; delivering 5.15% YOY revenue growth through structured outbound account engagement.</li>
    <li><strong>Account Relationship Management:</strong> Built and maintained strong relationships with buyers, department managers, and store leadership &mdash; serving as the primary point of contact for product inquiries, resets, and escalations across the territory.</li>
    <li><strong>Presentations to Buyer Groups:</strong> Conducted product demonstrations, competitive comparisons, and launch presentations &mdash; adapting messaging and emphasis to each stakeholder's specific priorities.</li>
    <li><strong>Space &amp; Contract Wins:</strong> Negotiated additional floor space and secondary display positions &mdash; securing incremental placement and driving higher sell-through velocity.</li>
    <li><strong>Executional Reliability:</strong> Maintained 100% planogram compliance and 90%+ completion rate on merchandising resets and new product launches across all accounts.</li>
  </ul>
</div>
{DCU_BULLETS}
"""
make_pdf(wrap(body, "Relocating to Raleigh, NC &mdash; Available Immediately"), "Collin_Celic_Resume_Cardinal_Health.pdf")

# ─────────────────────────────────────────────
# 5. HENRY SCHEIN
# ─────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Analytically sharp B2B territory sales professional with 4+ years of field experience managing multimillion-dollar accounts through consultative selling, data-driven territory planning, and structured business reviews. Proven track record of exceeding quota, growing market share in competitive environments, and building long-term partnerships with business owners and key decision-makers. Proficient in Salesforce CRM and Power BI for pipeline management and performance reporting. Relocating to Raleigh, NC and seeking a Sales Specialist opportunity with Henry Schein where a disciplined, analytics-backed field approach drives measurable account growth.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
  ("B2B Territory Sales &amp; Account Management", "Business Reviews &amp; Analytics-Driven Selling", "Consultative / Solution Selling"),
  ("Salesforce CRM &amp; Power BI Reporting", "Product Demonstrations &amp; Stakeholder Training", "New Business Prospecting &amp; Pipeline Development"),
  ("Market Share Growth in Competitive Markets", "Contract Negotiation &amp; Value-Based Selling", "Multi-Stakeholder Relationship Building"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Territory Ownership:</strong> Managed a $5.47M annual portfolio across 23 accounts &mdash; responsible for account health, revenue performance, and consultative partnership with dealer principals and decision-makers.</li>
    <li><strong>Business Reviews &amp; Account Analytics:</strong> Conducted structured account reviews using Power BI dashboards and Salesforce CRM &mdash; identifying revenue gaps, growth opportunities, and priority targets to guide field activity and quarterly planning.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026 through disciplined consultative engagement, strategic account prioritization, and strong closing execution.</li>
    <li><strong>Market Share Growth:</strong> Grew market share across multiple accounts during an industry-wide 8% market downturn &mdash; demonstrating the ability to protect and grow revenue through analytics-backed partnership and account service.</li>
    <li><strong>Product Education at Scale:</strong> Delivered structured product training and demonstrations across 23 locations, converting account-level teams into knowledgeable brand advocates &mdash; improving sell-through and competitive positioning.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue Growth:</strong> Managed a $4.06M multi-brand territory (Milwaukee Tool, Ryobi, Ridgid) &mdash; achieving 5.15% YOY sales growth through structured account planning and daily outbound field engagement.</li>
    <li><strong>Consultative Account Presentations:</strong> Delivered competitive product demonstrations, launch briefings, and ROI presentations to buyer groups and department managers &mdash; adapting content and approach to each audience.</li>
    <li><strong>CRM &amp; Pipeline Discipline:</strong> Maintained accurate account records, tracked field activity, and managed a multi-account pipeline to ensure consistent coverage and timely follow-up across the territory.</li>
    <li><strong>Contract &amp; Space Wins:</strong> Negotiated expanded floor space and secondary display placements &mdash; driving incremental revenue and increasing brand presence at the account level.</li>
    <li><strong>Executional Reliability:</strong> Maintained 100% planogram compliance and 90%+ completion rate on complex resets and new product launches across all accounts.</li>
  </ul>
</div>
{DCU_BULLETS}
"""
make_pdf(wrap(body, "Relocating to Raleigh, NC &mdash; Available Immediately"), "Collin_Celic_Resume_Henry_Schein.pdf")

# ─────────────────────────────────────────────
# 6. MEDTRONIC
# ─────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Consultative B2B field sales professional with 4+ years of experience managing multimillion-dollar territories, delivering structured product education to professional audiences, and building long-term advisory relationships with key decision-makers. Combines a strong track record of quota attainment and market share growth with deep Salesforce and Power BI proficiency. Seeking to apply disciplined territory sales skills to Medtronic&rsquo;s Pelvic Health division &mdash; motivated by the opportunity to sell solutions that improve patient quality of life and backed by the work ethic to learn the clinical context and compete.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
  ("B2B Territory Sales &amp; Field Execution", "Product Education &amp; Clinical Presentations", "Consultative / Solution Selling"),
  ("Salesforce CRM &amp; Power BI Analytics", "Quota Attainment &amp; Market Share Growth", "Multi-Stakeholder Relationship Management"),
  ("Full Sales Cycle &mdash; Discovery to Close", "Account Planning &amp; Business Reviews", "New Business Development &amp; Prospecting"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Territory Ownership:</strong> Managed full sales responsibility for a $5.47M annual portfolio spanning 23 accounts &mdash; accountable for revenue performance, account health, and consultative partnership with principal-level buyers.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026 &mdash; demonstrating strong execution and closing discipline when fully ramped in a competitive territory.</li>
    <li><strong>Market Share Growth in Declining Market:</strong> Grew market share across multiple key accounts during an industry-wide 8% market downturn &mdash; by deepening account relationships, identifying unmet needs, and differentiating through service quality and consultative engagement.</li>
    <li><strong>Product Education &amp; Stakeholder Training:</strong> Delivered structured product education and demonstrations across 23 locations, training multi-level account teams on product performance and application &mdash; directly analogous to educating clinical staff and practice administrators on a medical portfolio.</li>
    <li><strong>CRM &amp; Data-Driven Territory Management:</strong> Used Salesforce CRM and Power BI dashboards to track KPIs, manage account-level pipeline, optimize field routing, and produce territory forecasts for regional leadership.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue Growth:</strong> Managed a $4.06M multi-brand territory (Milwaukee Tool, Ryobi, Ridgid) &mdash; achieving 5.15% YOY revenue growth through daily field engagement and strategic account coverage.</li>
    <li><strong>In-Field Product Demonstrations:</strong> Conducted live product demonstrations and competitive comparisons for professional buyer audiences &mdash; adapting clinical and technical product messaging to each stakeholder's specific concerns.</li>
    <li><strong>Account Relationship Building:</strong> Built trusted relationships with buyers, department managers, and store leadership through consistent presence and proactive communication &mdash; maintaining high account retention while growing revenue.</li>
    <li><strong>Executional Reliability:</strong> Maintained 100% planogram compliance and 90%+ completion rate on complex resets and product launches &mdash; demonstrating the follow-through and accountability that build durable account trust.</li>
  </ul>
</div>
{DCU_BULLETS}
"""
make_pdf(wrap(body), "Collin_Celic_Resume_Medtronic.pdf")

# ─────────────────────────────────────────────
# 7. EVOLUS
# ─────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>High-performance B2B outside sales professional with 4+ years managing premium, high-ticket product territories through consultative relationship selling, persuasive demonstrations, and disciplined new account acquisition. Proven ability to grow market share in declining markets, exceed quota consistently, and earn trusted advisor status with discerning professional buyers. Motivated to bring a consultative field sales track record and competitive drive to Evolus&rsquo;s Aesthetic Experience Manager role &mdash; where the ability to build genuine practitioner partnerships and execute on territory sales strategy matters most.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
  ("Premium Product &amp; Solution Selling", "Consultative Selling to Professional Buyers", "Territory Management &amp; New Account Acquisition"),
  ("Persuasive Product Demonstrations", "Strategic Account Partnership", "Salesforce CRM &amp; Power BI Analytics"),
  ("Quota Attainment &amp; Market Share Growth", "Full Sales Cycle &mdash; Discovery to Close", "Competitive Positioning &amp; Account Displacement"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Territory Ownership:</strong> Managed full sales responsibility for a $5.47M annual premium product portfolio spanning 23 high-volume accounts &mdash; selling a high-ticket, design-driven product to dealer principals, designers, and professional buyers.</li>
    <li><strong>Consultative Partnership Selling:</strong> Built trusted advisory relationships with owner-operators, dealer principals, and design professionals &mdash; serving as a strategic partner who understood their business and helped them grow it, not just a vendor pushing product.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026 through strong closing discipline, consistent field activity, and genuine account engagement.</li>
    <li><strong>Competitive Market Share Growth:</strong> Grew market share in multiple key accounts during an industry-wide 8% market downturn &mdash; winning business from entrenched competitor relationships through superior service and differentiated value.</li>
    <li><strong>Product Education &amp; Brand Advocacy:</strong> Delivered structured product demonstrations and education across 23 accounts, converting skeptical staff into enthusiastic brand advocates &mdash; driving premium product placement and improved end-consumer experience.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue:</strong> Managed a $4.06M multi-brand territory for Milwaukee Tool, Ryobi, and Ridgid &mdash; premium tool brands sold to professional buyers. Drove 5.15% YOY revenue growth.</li>
    <li><strong>High-Stakes Product Demonstrations:</strong> Conducted live product demonstrations and head-to-head competitive comparisons for professional buyer audiences, persuading trade buyers to switch from entrenched brands through performance-based selling.</li>
    <li><strong>New Account Acquisition:</strong> Secured additional floor space, secondary display positions, and incremental placement by building compelling, data-backed business cases for skeptical account decision-makers.</li>
    <li><strong>Strategic Relationship Development:</strong> Built lasting relationships with key account contacts through consistent in-person presence, proactive problem-solving, and a business partnership mindset.</li>
  </ul>
</div>
{DCU_BULLETS}
"""
make_pdf(wrap(body), "Collin_Celic_Resume_Evolus.pdf")

# ─────────────────────────────────────────────
# 8. ALLERGAN
# ─────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Driven B2B field sales professional with 4+ years of experience managing multimillion-dollar premium product territories through consultative relationship selling, persuasive demonstrations, and disciplined new account development. Track record of exceeding quota, growing market share against entrenched competition, and building deep trust with professional buyers who have high standards and many options. Seeking to transition from high-performance B2B territory sales into aesthetic pharmaceutical sales with Allergan Aesthetics &mdash; motivated by the brand, the product quality, and the opportunity to grow a territory in the Carolinas.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
  ("Consultative Selling to Professional Buyers", "Territory Management &amp; New Account Acquisition", "Premium Product &amp; Brand Representation"),
  ("Persuasive Demonstrations &amp; Clinical Education", "Quota Attainment &amp; Revenue Growth", "Salesforce CRM &amp; Power BI Analytics"),
  ("Full Sales Cycle &mdash; Discovery to Close", "Competitive Account Displacement", "Strategic Relationship Development"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Territory Ownership:</strong> Managed full sales accountability for a $5.47M annual portfolio across 23 accounts &mdash; selling a premium, design-forward product line to dealer principals, design professionals, and high-volume retail buyers in a competitive, relationship-driven market.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026, demonstrating strong execution and closing discipline when fully ramped.</li>
    <li><strong>Competitive Market Share Growth:</strong> Grew market share in multiple key accounts during an industry-wide 8% market downturn &mdash; winning and retaining business through superior account service, consultative partnership, and brand differentiation.</li>
    <li><strong>Premium Brand Representation:</strong> Sold a premium product to buyers who could always choose lower-cost alternatives &mdash; required deep product knowledge, confident value articulation, and the ability to position against price-only objections. Directly transferable to aesthetic pharmaceutical selling.</li>
    <li><strong>Product Education &amp; Advocacy:</strong> Delivered structured training and product demonstrations across 23 locations, converting staff into confident brand advocates &mdash; improving sell-through, competitive positioning, and end-customer satisfaction.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue:</strong> Managed a $4.06M multi-brand territory for Milwaukee Tool, Ryobi, and Ridgid &mdash; premium professional brands competing against entrenched alternatives. Achieved 5.15% YOY growth.</li>
    <li><strong>Persuasive Product Demonstrations:</strong> Conducted live product demonstrations and competitive comparisons for professional buyers &mdash; making the case for a premium product against lower-priced incumbents through performance, quality, and brand narrative.</li>
    <li><strong>New Business &amp; Space Acquisition:</strong> Secured additional floor space and display placement by winning trust of buyer groups through data-backed business cases and relationship credibility.</li>
    <li><strong>Executional Excellence:</strong> Maintained 100% planogram compliance and 90%+ reset completion rate &mdash; demonstrating the reliability that earns protected partnerships with demanding accounts.</li>
  </ul>
</div>
{DCU_BULLETS}
"""
make_pdf(wrap(body), "Collin_Celic_Resume_Allergan.pdf")

# ─────────────────────────────────────────────
# 9. PATTERSON COMPANIES
# ─────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Results-driven B2B territory sales professional with 4+ years of field experience managing multimillion-dollar account portfolios through consultative selling, structured account reviews, and disciplined new business development. Skilled at growing revenue in competitive markets, building deep account relationships with business owners and professional buyers, and executing high-frequency territory coverage with Salesforce CRM and Power BI. Relocating to North Carolina immediately and seeking a Territory Sales Representative role at Patterson Companies where a track record of quota attainment and account-level partnership creates immediate impact.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
  ("B2B Territory Sales &amp; Account Management", "New Business Prospecting &amp; Pipeline Development", "Consultative / Solution Selling"),
  ("Salesforce CRM &amp; Power BI Analytics", "Product Education &amp; Demonstrations", "Full Sales Cycle &mdash; Discovery to Close"),
  ("Market Share Growth in Competitive Markets", "Business Reviews &amp; Account Planning", "Contract Negotiation &amp; Value-Based Selling"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Territory Ownership:</strong> Held full B2B sales responsibility for a $5.47M annual portfolio spanning 23 accounts &mdash; managing account health, revenue performance, and strategic partnership with principal-level buyers.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026 through disciplined account prioritization, consistent field presence, and strong consultative closing execution.</li>
    <li><strong>Market Share Growth:</strong> Grew market share across multiple key accounts during an industry-wide 8% market downturn &mdash; retaining and growing revenue by deepening account partnerships and differentiating through service quality.</li>
    <li><strong>Account Reviews &amp; Business Planning:</strong> Conducted structured account reviews with dealer principals and buyers, analyzing performance data and jointly developing plans to grow revenue and protect account share.</li>
    <li><strong>Product Education at Scale:</strong> Delivered product training and demonstrations across 23 accounts, training multi-level account teams and improving sell-through &mdash; directly mirrors Patterson&rsquo;s emphasis on product knowledge and staff education.</li>
    <li><strong>CRM-Driven Territory Execution:</strong> Used Salesforce CRM and Power BI dashboards to manage pipeline, track account KPIs, optimize field routing, and forecast performance for regional management.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue Growth:</strong> Managed a $4.06M multi-brand territory (Milwaukee Tool, Ryobi, Ridgid) &mdash; delivering 5.15% YOY growth through daily face-to-face account engagement and strategic territory coverage.</li>
    <li><strong>New Account Development:</strong> Grew incremental revenue by prospecting new buyer relationships and displacing competitor product placements through consultative sales and ROI-based positioning.</li>
    <li><strong>Product Demonstrations &amp; Buyer Education:</strong> Conducted live product demonstrations and launch presentations for buyer groups &mdash; adapting content to each audience and persuading professional buyers on product value.</li>
    <li><strong>Executional Reliability:</strong> Maintained 100% planogram compliance and 90%+ reset completion rate &mdash; demonstrating the follow-through that makes a rep the account&rsquo;s most trusted vendor.</li>
  </ul>
</div>
{DCU_BULLETS}
"""
make_pdf(wrap(body), "Collin_Celic_Resume_Patterson.pdf")

print("\nAll PDFs generated successfully.")
