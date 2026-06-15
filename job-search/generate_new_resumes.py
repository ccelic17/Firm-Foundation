"""
generate_new_resumes.py
Generates 12 tailored PDF resumes for positions #14–25 in Collin Celic's job search campaign.
"""

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
.cl-date { margin-bottom: 14px; font-size: 10.5pt; }
.cl-addressee { margin-bottom: 14px; font-size: 10.5pt; line-height: 1.6; }
.cl-body p { font-size: 10.5pt; line-height: 1.5; margin-bottom: 12px; }
.cl-sign { font-size: 10.5pt; margin-top: 16px; }
"""

OUTPUT_DIR = "/home/user/Firm-Foundation/job-search"

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

HEADER_CHARLOTTE = """
<div class="header">
  <h1>Collin Celic</h1>
  <div class="contact">
    ccelic17@gmail.com &nbsp;|&nbsp; (978) 512-2026 &nbsp;|&nbsp; linkedin.com/in/collin-celic<br>
    Relocating to Charlotte, NC &mdash; Available Immediately
  </div>
</div>
"""

HEADER_RALEIGH = """
<div class="header">
  <h1>Collin Celic</h1>
  <div class="contact">
    ccelic17@gmail.com &nbsp;|&nbsp; (978) 512-2026 &nbsp;|&nbsp; linkedin.com/in/collin-celic<br>
    Relocating to Raleigh, NC &mdash; Available Immediately
  </div>
</div>
"""

HEADER_NC = """
<div class="header">
  <h1>Collin Celic</h1>
  <div class="contact">
    ccelic17@gmail.com &nbsp;|&nbsp; (978) 512-2026 &nbsp;|&nbsp; linkedin.com/in/collin-celic<br>
    Relocating to Charlotte / Raleigh, NC &mdash; Available Immediately
  </div>
</div>
"""


def competency_table(rows):
    html = '<table class="competencies-table">'
    for r in rows:
        html += "<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>"
    html += "</table>"
    return html


def wrap(header, body):
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>{CSS_STYLES}</style></head><body>
{header}
{body}
{EDUCATION}
{SKILLS}
</body></html>"""


def make_pdf(html, filename):
    path = f"{OUTPUT_DIR}/{filename}"
    HTML(string=html).write_pdf(path)
    print(f"  Generated: {filename}")
    return path


# ─────────────────────────────────────────────────────────────────────────────
# 14. ADP — ENTRY LEVEL OUTSIDE SALES (RALEIGH)
# ─────────────────────────────────────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>High-activity B2B outside sales professional with 4+ years of experience managing multimillion-dollar territories through cold prospecting, consultative discovery, and disciplined pipeline management. Proven ability to exceed quota in competitive new business hunting environments, build rapid trust with small-to-medium business owners, and close effectively in high-volume, fast-cycle selling. Proficient in Salesforce CRM for territory management and pipeline tracking. Relocating to Raleigh, NC immediately &mdash; targeting an ADP Outside Sales role where a proven field prospecting track record and competitive drive can produce top-tier results in an uncapped commission environment.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
    ("B2B Outside Sales &amp; New Account Acquisition", "Cold Prospecting &amp; Pipeline Development", "Consultative / Needs-Based Selling"),
    ("Salesforce CRM &amp; Territory Management", "Full Sales Cycle &mdash; Prospecting to Close", "Objection Handling &amp; Competitive Closing"),
    ("SMB Business Owner Engagement", "Quota Attainment &amp; Activity Accountability", "Revenue Growth in Competitive Territories"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Achieved 145% of monthly sales quota in January 2026 through disciplined field activity, Salesforce pipeline management, and consistent consultative closing execution.</li>
    <li><strong>Territory Ownership:</strong> Held full B2B sales responsibility for a $5.47M annual portfolio spanning 23 accounts &mdash; managing pipeline from cold prospect through close and long-term account retention.</li>
    <li><strong>New Business Development:</strong> Grew market share across multiple accounts during an industry-wide 8% market downturn by displacing entrenched competitor relationships through superior service and consultative engagement.</li>
    <li><strong>CRM-Driven Territory Planning:</strong> Used Salesforce CRM and Power BI dashboards daily to manage call routing, track KPIs, prioritize high-opportunity accounts, and maintain full pipeline visibility for regional management.</li>
    <li><strong>Consultative Selling to Business Owners:</strong> Engaged dealer principals and owner-operators through discovery-first consultative conversations, identifying business priorities and aligning product solutions to measurable outcomes.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>High-Activity Cold Prospecting:</strong> Generated new business through daily in-person cold calls to business owners, department managers, and purchasing decision-makers across a defined geographic territory.</li>
    <li><strong>Revenue Growth:</strong> Managed a $4.06M multi-brand territory (Milwaukee Tool, Ryobi, Ridgid) &mdash; achieving 5.15% YOY revenue growth through disciplined outbound field engagement and competitive account development.</li>
    <li><strong>Competitive Closing:</strong> Won new accounts and incremental business by displacing incumbent brand relationships through performance-based demonstrations and value-driven consultative selling.</li>
    <li><strong>Pipeline Management:</strong> Maintained a structured prospect pipeline with consistent follow-up cadence, advancing opportunities from initial cold contact through contract and first delivery.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>High-Volume Quota Attainment:</strong> Consistently exceeded monthly sales quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative, needs-based selling to cold inbound contacts.</li>
    <li><strong>Objection Handling &amp; Fast-Cycle Closing:</strong> Developed strong objection-handling and rapid-close skills in a high-compliance, high-volume phone sales environment &mdash; directly applicable to ADP's SMB prospecting model.</li>
  </ul>
</div>
"""
make_pdf(wrap(HEADER_RALEIGH, body), "Collin_Celic_Resume_ADP_Raleigh.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 15. ADP — ENTRY LEVEL OUTSIDE SALES (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Results-driven B2B outside sales professional with 4+ years managing multimillion-dollar territories through cold prospecting, consultative selling, and Salesforce-tracked pipeline discipline. Proven ability to exceed quota in high-activity new business environments, build trust with SMB decision-makers, and close efficiently across short sales cycles. Excels in competitive markets where daily field execution and CRM accountability drive income. Relocating to Charlotte, NC immediately &mdash; seeking an ADP Outside Sales role where prospecting intensity, quota consistency, and consultative B2B skill set translate directly to uncapped earnings.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
    ("New Account Acquisition &amp; Cold Prospecting", "Consultative / Needs-Based Selling", "Salesforce CRM &amp; Pipeline Management"),
    ("SMB Buyer Engagement &amp; Relationship Building", "Full Sales Cycle &mdash; Cold Call to Close", "Objection Handling &amp; Competitive Displacement"),
    ("Territory Planning &amp; Call Routing", "Quota Attainment in High-Activity Environments", "B2B Outside Field Sales"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Pipeline Development &amp; Quota:</strong> Built and managed a full prospect-to-close pipeline across 23 accounts and a $5.47M annual territory &mdash; achieving 145% of monthly sales quota in January 2026 through disciplined Salesforce-managed pipeline execution.</li>
    <li><strong>New Business Hunting:</strong> Actively developed new business opportunities within the existing account base and from competitive accounts &mdash; growing market share during an industry-wide 8% contraction by displacing entrenched competitor relationships.</li>
    <li><strong>SMB Owner Engagement:</strong> Built consultative relationships with dealer principals and owner-operators, leading with business discovery to align KraftMaid solutions to their specific revenue and operational goals.</li>
    <li><strong>CRM Activity Discipline:</strong> Used Salesforce CRM and Power BI daily to track field activity, advance pipeline, prioritize accounts, and maintain reporting accuracy for regional management &mdash; the exact workflow ADP's sales model is built around.</li>
    <li><strong>Competitive Territory Management:</strong> Analyzed competitive positioning and account vulnerability weekly, adjusting call prioritization and sales approach to protect and grow revenue in a contested market.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Daily Cold Prospecting:</strong> Drove new business exclusively through face-to-face cold calls to business owners and purchasing managers in a defined territory &mdash; generating 5.15% YOY revenue growth on a $4.06M multi-brand territory.</li>
    <li><strong>Fast-Cycle Competitive Closing:</strong> Converted cold prospects into committed accounts by presenting a compelling value case against established incumbent brands &mdash; winning on consultative approach and in-person demonstration, not on price alone.</li>
    <li><strong>Account Development:</strong> Expanded incremental revenue within existing accounts through structured upsell conversations, product line introductions, and floor space expansion tied to measurable sell-through improvement.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Exceeded monthly sales quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative phone-based selling with structured objection handling and needs-based positioning.</li>
    <li><strong>Regulated Compliance Sales:</strong> Developed closing and discovery skills in a high-compliance, high-volume environment &mdash; directly relevant to ADP's payroll and HR compliance-adjacent product conversations with SMB owners.</li>
  </ul>
</div>
"""
make_pdf(wrap(HEADER_CHARLOTTE, body), "Collin_Celic_Resume_ADP_Charlotte.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 16. ADP — ACCOUNT EXECUTIVE (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Proven B2B Account Executive with 4+ years of multimillion-dollar territory management, quota-beating performance, and consultative relationship selling to business owner and principal-level buyers. Demonstrated ability to manage a complex account portfolio through data-driven Salesforce planning, structured business reviews, and strategic multi-stakeholder engagement. Track record of exceeding quota in competitive territories, growing market share in declining markets, and closing complex, relationship-dependent sales. Relocating to Charlotte, NC immediately &mdash; seeking an ADP Account Executive role where a seasoned B2B quota track record and strategic account management capability drive a high-earning territory outcome.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
    ("Strategic Account Management &amp; Growth", "B2B Consultative Selling to Principal-Level Buyers", "Full Sales Cycle &mdash; Prospecting Through Renewal"),
    ("Salesforce CRM &amp; Power BI Analytics", "Territory Planning &amp; Pipeline Forecasting", "Business Reviews &amp; Multi-Stakeholder Presentations"),
    ("Quota Attainment &amp; Revenue Growth", "Competitive Account Displacement", "Complex Deal Negotiation &amp; Closing"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Revenue Accountability:</strong> Held full P&amp;L responsibility for a $5.47M annual territory spanning 23 high-volume B2B accounts &mdash; accountable for every dollar of revenue, every account relationship, and every competitive positioning decision in the geography.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026 through disciplined account prioritization, strategic pipeline management, and consultative closing execution with principal-level buyers.</li>
    <li><strong>Account Growth in a Declining Market:</strong> Grew market share across multiple key accounts during an industry-wide 8% market downturn &mdash; protecting and growing revenue through superior consultative account service and competitive intelligence.</li>
    <li><strong>Strategic Business Reviews:</strong> Conducted structured quarterly account reviews with dealer principals and key buyers &mdash; presenting performance data, identifying joint growth opportunities, and building account-level strategic plans using Power BI and Salesforce analytics.</li>
    <li><strong>Multi-Stakeholder Account Management:</strong> Navigated complex account relationships with multiple contacts at each location (owner, buyer, floor associates) &mdash; tailoring messaging and approach to each stakeholder's role and business priorities.</li>
    <li><strong>CRM-Driven Territory Forecasting:</strong> Maintained full Salesforce pipeline visibility and produced accurate territory forecasts for regional leadership &mdash; demonstrating the account management rigor required at the Account Executive level.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Territory Revenue Growth:</strong> Managed a $4.06M multi-brand territory (Milwaukee Tool, Ryobi, Ridgid) &mdash; delivering 5.15% YOY revenue growth through strategic account development and disciplined daily field engagement.</li>
    <li><strong>Competitive Displacement &amp; New Account Wins:</strong> Negotiated expanded floor space, secondary display positions, and new brand placement at competitive accounts by building a compelling ROI case and earning buyer trust through consistent service.</li>
    <li><strong>Buyer-Level Presentations:</strong> Conducted product presentations and competitive analysis sessions for buyer groups and department managers &mdash; adapting content and messaging to each audience's specific business priorities.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Consistently exceeded monthly sales quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative, needs-based selling in a high-compliance, high-volume environment.</li>
    <li><strong>Objection Handling &amp; Negotiation:</strong> Developed sophisticated objection-handling and negotiation skills managing complex financial conversations with customers who were often resistant to additional product discussions.</li>
  </ul>
</div>
"""
make_pdf(wrap(HEADER_CHARLOTTE, body), "Collin_Celic_Resume_ADP_AccountExec.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 17. PAYCHEX — SALES CONSULTANT (RALEIGH)
# ─────────────────────────────────────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Consultative B2B field sales professional with 4+ years of territory management experience, proven quota attainment, and a referral-relationship selling approach that drives long-term account growth. Skilled at engaging business owners and decision-makers through discovery-first consultative selling, building trusted advisor relationships across complex account bases, and managing territory activity through Salesforce CRM with Power BI analytics. Relocating to Raleigh, NC immediately &mdash; seeking a Paychex Sales Consultant role where a disciplined consultative field approach and strong new business development track record translate directly to HR/payroll solution selling.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
    ("Consultative / Solution Selling", "B2B Field Sales &amp; Territory Management", "Referral Relationship Development"),
    ("Salesforce CRM &amp; Pipeline Management", "Business Owner &amp; SMB Engagement", "New Business Prospecting &amp; Account Acquisition"),
    ("Full Sales Cycle &mdash; Discovery to Close", "Quota Attainment &amp; Revenue Growth", "Compliance-Adjacent Selling Environments"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Consultative Territory Management:</strong> Managed a $5.47M annual territory across 23 accounts through discovery-first consultative engagement with dealer principals and owner-operators &mdash; identifying business needs and aligning solutions to measurable outcomes rather than product pitching.</li>
    <li><strong>Referral Relationship Cultivation:</strong> Built advisory relationships with store leadership and buyer contacts who provided internal referrals to additional stakeholders &mdash; expanding account depth and revenue through trusted-source introductions, mirroring Paychex&rsquo;s CPA and banker referral model.</li>
    <li><strong>Quota Attainment:</strong> Achieved 145% of monthly sales quota in January 2026 through disciplined field execution, structured pipeline management, and strong consultative closing with business owner buyers.</li>
    <li><strong>CRM &amp; Activity Management:</strong> Used Salesforce CRM and Power BI to manage field day planning, track pipeline, and ensure consistent account coverage &mdash; maintaining high activity standards while managing a broad territory geography.</li>
    <li><strong>Market Share Growth:</strong> Grew market share in multiple accounts during an 8% industry downturn by deepening relationship equity with decision-makers and demonstrating measurable value through structured account reviews.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Field-Day Prospecting Discipline:</strong> Maintained a minimum three-day-per-week field presence across a defined territory &mdash; making in-person calls to buyers and decision-makers and advancing relationships through consistent follow-through and proactive account service.</li>
    <li><strong>Revenue Growth:</strong> Delivered 5.15% YOY revenue growth on a $4.06M multi-brand territory through structured outbound engagement and consultative relationship selling to professional buyer audiences.</li>
    <li><strong>New Account Development:</strong> Secured new account business and expanded existing accounts through consultative discovery, competitive positioning, and ROI-based value presentation to skeptical purchasing managers.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment in Compliance Environment:</strong> Exceeded monthly sales quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month via consultative, needs-based selling in a high-compliance financial services environment &mdash; directly relevant to Paychex&rsquo;s regulated HR and payroll product context.</li>
    <li><strong>Trust-Based Consultative Selling:</strong> Built rapid trust with customers to discuss sensitive financial topics, develop needs-based solutions, and close effectively &mdash; the same trust-building skill required to earn a business owner&rsquo;s payroll relationship.</li>
  </ul>
</div>
"""
make_pdf(wrap(HEADER_RALEIGH, body), "Collin_Celic_Resume_Paychex.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 18. CULLIGAN QUENCH — FIELD ACCOUNT EXECUTIVE (RALEIGH)
# ─────────────────────────────────────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>High-activity B2B field sales professional with 4+ years of experience managing multimillion-dollar territories through cold prospecting, new account acquisition, and disciplined face-to-face field execution. Proven record of exceeding quota, displacing incumbent vendor relationships, and building recurring account revenue through consistent in-person presence. Proficient in Salesforce CRM for territory management and pipeline discipline. Actively targeting the Culligan Quench territory in Raleigh, NC &mdash; relocating immediately to pursue a Field Account Executive role where B2B prospecting intensity and new account closing experience drive meaningful territory results.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
    ("B2B Outside Sales &amp; New Account Acquisition", "Face-to-Face Cold Prospecting", "Territory Development &amp; Geographic Coverage"),
    ("Salesforce CRM &amp; Pipeline Management", "Competitive Account Displacement", "Recurring Revenue &amp; Contract Selling"),
    ("Full Sales Cycle &mdash; Cold Call to Close", "Business Owner &amp; Facilities Buyer Engagement", "Quota Attainment &amp; Activity Accountability"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>New Account Development:</strong> Actively prospected new business within the territory while managing 23 existing accounts &mdash; cold-calling buyers and owner-operators, qualifying opportunities, and advancing prospects through a structured pipeline to close.</li>
    <li><strong>Territory Ownership:</strong> Held full B2B sales accountability for a $5.47M annual portfolio &mdash; managing geography routing, account coverage frequency, and competitive displacement activity with Salesforce CRM and Power BI.</li>
    <li><strong>Quota Attainment:</strong> Achieved 145% of monthly sales quota in January 2026 through consistent high-activity field execution and disciplined consultative closing with business owner buyers.</li>
    <li><strong>Competitive Account Displacement:</strong> Grew market share in multiple accounts during an industry-wide 8% downturn by displacing entrenched competitor relationships through superior presence, service, and consultative account engagement.</li>
    <li><strong>Account Relationship Building:</strong> Built trusted vendor-partner relationships with dealer principals and owner-operators who relied on regular face-to-face visits and proactive service &mdash; mirroring the recurring touchpoint model of a Quench territory.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Daily Face-to-Face Prospecting:</strong> Generated all new business through in-person cold calls to business owners, department managers, and facilities purchasing contacts in a defined geographic territory &mdash; the exact motion a Quench Field AE executes daily.</li>
    <li><strong>Revenue Growth:</strong> Delivered 5.15% YOY revenue growth on a $4.06M multi-brand territory through high-frequency field activity and systematic account development from cold start to committed purchase.</li>
    <li><strong>Competitive Displacement:</strong> Won new floor space and purchasing commitment from accounts that had existing relationships with competing brands &mdash; through performance demonstration, relationship investment, and persistent follow-through.</li>
    <li><strong>Geographic Territory Execution:</strong> Planned and executed efficient daily call routes across a broad geographic territory, maximizing face-to-face contacts while managing travel and time to quota-critical accounts.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Consistently exceeded monthly sales quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative, needs-based selling and structured objection handling.</li>
    <li><strong>Objection Handling &amp; Fast-Cycle Closing:</strong> Developed rapid qualification, objection resolution, and closing skills in a high-volume, time-pressured environment &mdash; applicable to Quench&rsquo;s short-cycle B2B new account sales model.</li>
  </ul>
</div>
"""
make_pdf(wrap(HEADER_RALEIGH, body), "Collin_Celic_Resume_Culligan_Quench.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 19. UNIFIRST — OUTSIDE SALES (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Competitive B2B outside sales professional with 4+ years of high-activity field territory experience, proven cold prospecting discipline, and a consistent track record of exceeding quota through new account development and competitive account displacement. Thrives in prospecting-first environments where territory income is a function of daily field activity, persistent follow-through, and the ability to displace incumbent service relationships through consultative selling. Relocating to Charlotte, NC immediately &mdash; targeting a UniFirst Outside Sales role where competitive drive, face-to-face prospecting intensity, and a proven B2B new business track record produce strong territory results from day one.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
    ("B2B Outside Field Sales &amp; Cold Prospecting", "New Account Acquisition &amp; Competitive Displacement", "Territory Development from Cold Start"),
    ("Salesforce CRM &amp; Pipeline Management", "Full Sales Cycle &mdash; Prospecting to Contract", "Objection Handling &amp; Competitive Closing"),
    ("Quota Attainment &amp; Activity Accountability", "Business Owner Engagement &amp; Trust Building", "Recurring Revenue &amp; Service Contract Selling"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Competitive Territory Development:</strong> Grew market share across multiple accounts during an industry-wide 8% market downturn by displacing entrenched competitor relationships &mdash; the same competitive account displacement skill that drives UniFirst territory growth.</li>
    <li><strong>Quota Attainment:</strong> Achieved 145% of monthly sales quota in January 2026 through disciplined field execution, Salesforce pipeline tracking, and consistent consultative closing with owner-operator buyers.</li>
    <li><strong>New Business Prospecting:</strong> Combined ongoing management of 23 existing accounts with active new business cold prospecting &mdash; building a qualified pipeline of new accounts alongside revenue responsibilities in an existing portfolio.</li>
    <li><strong>Territory Ownership:</strong> Held full accountability for a $5.47M annual territory &mdash; responsible for every revenue dollar, every competitive risk, and every account relationship in the geography.</li>
    <li><strong>CRM Accountability:</strong> Managed all field activity and pipeline through Salesforce CRM, maintaining daily logging discipline and full visibility for regional management &mdash; the activity-accountability model UniFirst&rsquo;s sales culture is built around.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Daily Cold Prospecting:</strong> Built all territory revenue through daily in-person cold calls to business owners, purchasing managers, and department decision-makers &mdash; generating 5.15% YOY revenue growth on a $4.06M territory from persistent high-activity prospecting.</li>
    <li><strong>Competitive Account Wins:</strong> Displaced incumbent brand relationships at multiple accounts through performance-based demonstrations, superior service commitment, and persistent relationship development over time.</li>
    <li><strong>Service-Oriented Account Building:</strong> Maintained and grew accounts through reliable follow-through, proactive service, and consistent in-person presence &mdash; building the kind of account loyalty that resists competitive counter-calls.</li>
    <li><strong>Pipeline Execution:</strong> Managed a structured prospect-to-close pipeline, advancing cold contacts through qualification, demonstration, proposal, and commitment stages with disciplined CRM tracking.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Exceeded monthly sales quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative needs-based selling and structured objection handling.</li>
    <li><strong>Persistence &amp; Objection Handling:</strong> Developed strong skills in handling repeated objections, maintaining positive engagement across long follow-up cycles, and closing after multiple contact attempts &mdash; applicable to UniFirst&rsquo;s long-prospect cycle in service contract acquisition.</li>
  </ul>
</div>
"""
make_pdf(wrap(HEADER_CHARLOTTE, body), "Collin_Celic_Resume_UniFirst_Charlotte.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 20. UNIFIRST — OUTSIDE SALES (RALEIGH-DURHAM)
# ─────────────────────────────────────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Driven B2B outside sales professional with 4+ years of field territory experience, high-volume cold prospecting discipline, and a proven ability to win new accounts from entrenched incumbent service relationships. Consistent quota performer in competitive, activity-driven environments where new business development is the primary revenue engine. Proficient in Salesforce CRM for pipeline management and territory accountability. Relocating to Raleigh-Durham, NC immediately &mdash; targeting a UniFirst Outside Sales role where competitive new account acquisition skills, daily face-to-face prospecting discipline, and a strong track record of exceeding quota create immediate territory value.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
    ("Cold Prospecting &amp; New Account Acquisition", "Competitive Account Displacement", "B2B Outside Field Sales"),
    ("Salesforce CRM &amp; Activity Management", "Full Sales Cycle &mdash; Cold Call to Contract", "Service Contract &amp; Recurring Revenue Selling"),
    ("Objection Handling &amp; Persistence Closing", "Business Owner &amp; Operations Buyer Engagement", "Quota Attainment &amp; High-Activity Execution"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Competitive Market Share Growth:</strong> Grew market share in multiple accounts during an industry-wide 8% contraction by persistently displacing competitor relationships through superior service and consultative engagement &mdash; the same mechanism that drives UniFirst territory growth in Raleigh-Durham.</li>
    <li><strong>Quota Attainment:</strong> Achieved 145% of monthly sales quota in January 2026 through disciplined daily field activity, Salesforce pipeline management, and consistent closing execution with owner-operator buyers.</li>
    <li><strong>Territory Revenue Accountability:</strong> Held full ownership of a $5.47M annual territory across 23 accounts &mdash; combining active new business prospecting with ongoing account management to maintain and grow every revenue line in the geography.</li>
    <li><strong>CRM Pipeline Discipline:</strong> Logged all field activity in Salesforce CRM, maintained accurate pipeline forecasts, and used Power BI dashboards to prioritize call routing and identify competitive displacement targets.</li>
    <li><strong>Business Owner Relationship Building:</strong> Cultivated long-term relationships with dealer principals and owner-operators through consistent in-person presence, proactive service, and business-outcome-focused consultative selling.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>High-Volume Cold Prospecting:</strong> Generated 100% of new territory business through daily in-person cold calls to business owners and purchasing decision-makers &mdash; 5.15% YOY revenue growth on a $4.06M territory from prospecting discipline alone.</li>
    <li><strong>Incumbent Displacement:</strong> Won new accounts from established competitor brand relationships at multiple locations by making a compelling performance case in person and following through with superior account service.</li>
    <li><strong>Account Retention Through Service:</strong> Maintained a high account retention rate through proactive in-person visits, rapid response to account needs, and consistent follow-through on commitments &mdash; building the account loyalty that resists competitor prospecting.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Consistently exceeded monthly sales quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative phone-based selling, objection handling, and needs-based positioning.</li>
    <li><strong>Objection Resolution:</strong> Developed strong skills in handling resistance and maintaining positive engagement across long contact sequences &mdash; applicable to UniFirst&rsquo;s multi-touch new account development process.</li>
  </ul>
</div>
"""
make_pdf(wrap(HEADER_RALEIGH, body), "Collin_Celic_Resume_UniFirst_Raleigh.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 21. SYSCO — SALES CONSULTANT (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Consultative B2B territory sales professional with 4+ years of field experience managing multimillion-dollar account portfolios through structured account reviews, consistent face-to-face coverage, and disciplined new business development. Proven ability to grow revenue inside existing accounts, acquire new accounts from competitive sources, and build lasting advisory relationships with business owners and purchasing decision-makers. Proficient in Salesforce CRM and Power BI for territory planning and performance tracking. Relocating to Charlotte, NC immediately &mdash; targeting a Sysco Sales Consultant role where a disciplined, relationship-first territory approach drives account penetration and new customer acquisition across the Charlotte foodservice market.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
    ("Account Penetration &amp; Wallet Share Growth", "New Business Prospecting &amp; Customer Acquisition", "Consultative / Solution Selling"),
    ("Salesforce CRM &amp; Territory Planning", "Business Reviews &amp; Account-Level Analytics", "Face-to-Face Field Sales &amp; Account Coverage"),
    ("Quota Attainment &amp; Revenue Growth", "Restaurant / Operator Buyer Engagement", "Competitive Displacement &amp; Market Share Growth"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Account Penetration &amp; Growth:</strong> Managed a $5.47M annual territory across 23 B2B accounts, consistently identifying opportunities to grow wallet share within existing accounts through structured reviews, product training, and consultative business planning.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026 through a combination of deep account penetration discipline and targeted new business prospecting activity.</li>
    <li><strong>Market Share Growth in Declining Market:</strong> Grew revenue in multiple key accounts during an industry-wide 8% contraction by staying closer to account decision-makers and providing more value than competing vendors.</li>
    <li><strong>Business Reviews &amp; Account Planning:</strong> Conducted structured account business reviews with dealer principals &mdash; analyzing performance data, identifying gaps, and building joint growth plans &mdash; directly parallel to Sysco&rsquo;s account review model with operator customers.</li>
    <li><strong>CRM-Driven Territory Management:</strong> Used Salesforce CRM and Power BI to manage pipeline, track account coverage, optimize call routing, and forecast revenue performance for regional management.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>New Account Development:</strong> Drove 5.15% YOY revenue growth on a $4.06M territory through daily in-person prospecting and structured new account acquisition from cold start.</li>
    <li><strong>Product &amp; Value-Based Selling:</strong> Positioned product value to purchasing managers and buyers who had existing supplier relationships &mdash; winning business through consultative selling and product demonstration rather than price competition.</li>
    <li><strong>Consistent Field Coverage:</strong> Maintained daily in-person account presence across a broad geographic territory, building the kind of trusted vendor relationships that make account switching costly for competitors to attempt.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Exceeded monthly quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative needs-based selling and disciplined objection handling.</li>
    <li><strong>Consultative Relationship Development:</strong> Built trust rapidly with customers to discuss financial needs and recommend appropriate solutions &mdash; the same consultative relationship dynamic that defines a Sysco rep&rsquo;s value to a restaurant operator.</li>
  </ul>
</div>
"""
make_pdf(wrap(HEADER_CHARLOTTE, body), "Collin_Celic_Resume_Sysco.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 22. BOSTON SCIENTIFIC — TERRITORY EXECUTIVE, UROLOGY / eCOIN (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Results-driven B2B field sales professional with 4+ years of multimillion-dollar territory management, disciplined Salesforce-driven planning, and a proven ability to deliver structured product education and demonstrations to professional buyer audiences. Strong track record of quota attainment, market share growth in declining markets, and building trusted advisory relationships with principal-level decision-makers. Motivated to transition into medical device sales with Boston Scientific's Urology division, bringing a complete field sales infrastructure and the commitment to earn clinical credibility through deep product study and in-field preparation. Relocating to Charlotte, NC immediately.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
    ("Territory Sales &amp; Field Execution", "Clinical Product Education &amp; In-Services", "Consultative / Solution Selling"),
    ("Salesforce CRM &amp; Power BI Analytics", "Structured Demonstrations to Professional Buyers", "Full Sales Cycle &mdash; Discovery to Procedure Adoption"),
    ("Account Relationship Management", "Competitive Positioning &amp; Market Share Growth", "Quota Attainment &amp; Revenue Growth"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Territory Ownership:</strong> Held full revenue responsibility for a $5.47M annual portfolio across 23 high-volume B2B accounts &mdash; accountable for revenue performance, competitive positioning, and account relationship quality in the geography.</li>
    <li><strong>Product Education &amp; In-Service Delivery:</strong> Delivered structured product demonstrations and education sessions across 23 locations, training multi-level account teams on complex product performance and application &mdash; the same skill set used to conduct clinical in-services for physician and staff audiences.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026 through disciplined field planning, Salesforce pipeline management, and strong consultative closing with principal-level buyers.</li>
    <li><strong>Market Share Growth in Declining Market:</strong> Grew market share across multiple key accounts during an industry-wide 8% market downturn by deepening account relationships and delivering consistent value that competitors did not match.</li>
    <li><strong>CRM-Driven Territory Planning:</strong> Used Salesforce CRM and Power BI daily to manage account-level pipeline, optimize field routing, track KPIs, and forecast territory performance for regional leadership.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Live Product Demonstrations:</strong> Conducted daily in-person product demonstrations for professional buyer audiences, making complex technical performance comparisons accessible and persuasive to decision-makers with competing priorities.</li>
    <li><strong>Territory Revenue Growth:</strong> Managed a $4.06M multi-brand territory (Milwaukee Tool, Ryobi, Ridgid) &mdash; achieving 5.15% YOY revenue growth through structured outbound field engagement and competitive account development.</li>
    <li><strong>Competitive Displacement:</strong> Won new account placements from established incumbent brands through superior demonstration preparation, relationship investment, and persistent in-person follow-through.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Exceeded monthly quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative needs-based selling and skilled objection handling in a high-compliance, regulated environment.</li>
    <li><strong>Regulated Selling Context:</strong> Operated in a compliance-heavy financial services environment requiring accurate product representation, disclosure adherence, and careful needs-matching &mdash; a mindset applicable to clinical device selling.</li>
  </ul>
</div>
"""
make_pdf(wrap(HEADER_CHARLOTTE, body), "Collin_Celic_Resume_Boston_Scientific.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 23. OLYMPUS — TERRITORY MANAGER, ENDOTHERAPY (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Consultative B2B field sales professional with 4+ years managing multimillion-dollar territories through structured product education, disciplined account relationship development, and data-driven territory planning. Proven ability to deliver product demonstrations to professional buyer audiences, build trusted advisory relationships with demanding decision-makers, and grow market share in competitive environments. Committed to transitioning into medical device sales with Olympus, bringing a complete field sales skill set and the preparation discipline to earn clinical credibility in an endotherapy account environment. Relocating to Charlotte, NC immediately.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
    ("Medical Device Territory Management", "Clinical In-Service &amp; Product Education", "Consultative Selling to Professional Buyers"),
    ("Salesforce CRM &amp; Power BI Analytics", "Structured Product Demonstrations", "Account Relationship Development"),
    ("Full Sales Cycle &mdash; Discovery to Adoption", "Market Share Growth &amp; Competitive Positioning", "Quota Attainment &amp; Field Execution"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Structured Product Education at Scale:</strong> Delivered formal product education and live demonstrations across 23 professional buyer accounts &mdash; training multi-level stakeholders on complex product features, application, and competitive differentiation. Directly translates to conducting clinical in-services with endoscopy staff and GI lab personnel.</li>
    <li><strong>Territory Ownership:</strong> Managed a $5.47M annual portfolio as the sole field representative &mdash; accountable for revenue performance, account health, and competitive positioning across a defined geography managed through Salesforce CRM and Power BI.</li>
    <li><strong>Quota Performance:</strong> Achieved 145% of monthly sales quota in January 2026 through disciplined field execution and strong consultative closing with principal-level buyers.</li>
    <li><strong>Competitive Market Share Growth:</strong> Grew market share during an industry-wide 8% market downturn by building stronger account relationships and delivering more consistent value than competing vendors.</li>
    <li><strong>Trusted Advisor Relationships:</strong> Earned trusted advisor status with dealer principals and owner-operators who relied on Collin as a business partner rather than a transactional vendor &mdash; the relationship quality required in clinical device selling.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Technical Product Demonstrations:</strong> Conducted daily live demonstrations of complex power tool products for professional buyer audiences &mdash; presenting technical specifications, performance differentiators, and competitive comparisons in a credible and persuasive format.</li>
    <li><strong>Territory Revenue Growth:</strong> Delivered 5.15% YOY growth on a $4.06M multi-brand territory through structured field engagement and systematic account development.</li>
    <li><strong>New Account Acquisition:</strong> Won new accounts from established incumbent competitors through superior product knowledge, relationship investment, and consistent in-person presence.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Exceeded monthly quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative needs-based selling in a high-compliance, regulated environment.</li>
    <li><strong>Complex Objection Handling:</strong> Developed strong skills in navigating sensitive financial conversations and handling resistance across extended contact cycles &mdash; applicable to the extended selling cycles common in clinical device account development.</li>
  </ul>
</div>
"""
make_pdf(wrap(HEADER_CHARLOTTE, body), "Collin_Celic_Resume_Olympus.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 24. FASTENAL — OUTSIDE SALES (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>High-activity B2B outside sales professional with 4+ years of field territory management experience, daily in-person prospecting discipline, and a proven track record of building new account relationships from cold contact through committed purchase. Skilled at engaging manufacturing, construction, and industrial buyer profiles, managing territory pipeline in Salesforce CRM, and competing effectively against established incumbent vendor relationships. Relocating to Charlotte, NC immediately &mdash; targeting a Fastenal Outside Sales role where face-to-face prospecting discipline, industrial buyer relationship building, and consistent quota performance translate into meaningful territory results from day one.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
    ("B2B Outside Sales &amp; Cold Prospecting", "Industrial / Trade Buyer Engagement", "New Account Development &amp; Competitive Displacement"),
    ("Salesforce CRM &amp; Pipeline Management", "Territory Planning &amp; Call Routing", "Full Sales Cycle &mdash; Cold Call to Purchase Order"),
    ("Quota Attainment &amp; Activity Accountability", "Face-to-Face Field Selling", "Product Knowledge &amp; Value-Based Positioning"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Achieved 145% of monthly sales quota in January 2026 through disciplined Salesforce-managed pipeline execution, systematic call routing, and consultative closing with B2B buyer accounts.</li>
    <li><strong>Territory Ownership:</strong> Held full B2B sales responsibility for 23 accounts and a $5.47M annual portfolio &mdash; managing everything from cold prospecting and opportunity development through contract and long-term account retention.</li>
    <li><strong>Competitive Displacement:</strong> Grew market share in multiple accounts during an industry-wide 8% market downturn by displacing entrenched competitor vendor relationships through superior presence, reliability, and consultative value delivery.</li>
    <li><strong>Field Presence &amp; Account Coverage:</strong> Built and executed a structured daily field call plan across a defined geography, maintaining consistent in-person contact frequency with all active and prospect accounts.</li>
    <li><strong>CRM Activity Discipline:</strong> Used Salesforce CRM and Power BI to track all field activity, manage pipeline stages, and maintain territory reporting accuracy &mdash; the same activity-accountability culture Fastenal&rsquo;s territory model requires.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Daily Industrial / Trade Cold Prospecting:</strong> Generated new business exclusively through daily in-person cold calls to construction supply buyers, department managers, and industrial purchasing contacts &mdash; 5.15% YOY revenue growth on a $4.06M territory through prospecting discipline in a trade-adjacent buyer environment.</li>
    <li><strong>Competitive Brand Displacement:</strong> Won new floor space and committed purchases from accounts that had established relationships with competing brands &mdash; through in-person demonstrations, ROI positioning, and persistent follow-through.</li>
    <li><strong>Product Knowledge Selling:</strong> Demonstrated complex product features and technical performance advantages to professional trade buyers who valued expertise over price &mdash; a selling dynamic directly applicable to Fastenal&rsquo;s MRO and industrial product line.</li>
    <li><strong>Account Relationship Development:</strong> Built lasting relationships with buyers and department managers through consistent field presence and proactive service, maintaining high retention rates while growing new business simultaneously.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Exceeded monthly sales quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative, needs-based selling and structured objection handling.</li>
    <li><strong>Fast-Cycle Closing:</strong> Developed efficient qualification, objection resolution, and closing skills in a high-volume, time-pressured phone environment &mdash; applicable to Fastenal&rsquo;s fast decision-cycle industrial account sales model.</li>
  </ul>
</div>
"""
make_pdf(wrap(HEADER_CHARLOTTE, body), "Collin_Celic_Resume_Fastenal.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 25. VESTIS (ARAMARK UNIFORMS) — SALES REPRESENTATIVE (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
body = f"""
<div class="section-title">Professional Summary</div>
<div class="summary"><p>Competitive B2B outside sales professional with 4+ years of high-activity field territory management, proven cold prospecting discipline, and a consistent track record of displacing entrenched incumbent vendor relationships through consultative selling and persistent follow-through. Excels in the high-frequency prospecting environment of recurring service contract sales &mdash; where territory income is built through daily face-to-face activity, relationship development, and the patience to execute a long-game new account strategy. Relocating to Charlotte, NC immediately &mdash; targeting a Vestis Sales Representative role where competitive drive, B2B prospecting intensity, and a strong new business track record drive territory growth against Cintas and UniFirst incumbents.</p></div>
<div class="section-title">Core Competencies</div>
{competency_table([
    ("B2B Outside Sales &amp; Cold Prospecting", "Competitive Incumbent Displacement", "Service Contract &amp; Recurring Revenue Selling"),
    ("Salesforce CRM &amp; Pipeline Management", "New Account Acquisition", "Full Sales Cycle &mdash; Cold Call to Contract Signing"),
    ("Quota Attainment &amp; Activity Accountability", "Business Owner &amp; Operations Buyer Engagement", "Territory Development from Cold Start"),
])}
<div class="section-title">Professional Experience</div>
<div class="job">
  <div class="job-title">Territory Manager &mdash; KraftMaid Cabinetry (CabinetWorks Group)</div>
  <div class="job-company">Boston, MA &nbsp;&bull;&nbsp; February 2025 &ndash; March 2026</div>
  <ul>
    <li><strong>Competitive Displacement &amp; Market Share Growth:</strong> Grew market share in multiple accounts during an industry-wide 8% contraction by persistently displacing entrenched competitor vendor relationships through superior account service and consultative engagement &mdash; the exact competitive dynamic Vestis reps execute against Cintas and UniFirst in Charlotte.</li>
    <li><strong>Quota Attainment:</strong> Achieved 145% of monthly sales quota in January 2026 through disciplined Salesforce pipeline management, daily field activity, and consistent consultative closing with owner-operator buyers.</li>
    <li><strong>Long-Game Territory Development:</strong> Built lasting account relationships through consistent in-person presence and proactive service over time &mdash; earning account loyalty by becoming more reliable and more useful than any competing vendor.</li>
    <li><strong>New Account Prospecting:</strong> Combined active new business cold prospecting with ongoing management of 23 existing accounts &mdash; maintaining a structured pipeline of competitive displacement opportunities while protecting the existing revenue base.</li>
    <li><strong>CRM Activity Discipline:</strong> Used Salesforce CRM and Power BI daily to track field activity, manage pipeline, prioritize call routing, and maintain full territory visibility for regional management.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Field Sales &amp; Marketing Representative &mdash; Techtronic Industries (TTI)</div>
  <div class="job-company">Bellingham, MA &nbsp;&bull;&nbsp; July 2023 &ndash; February 2025</div>
  <ul>
    <li><strong>Daily Cold Prospecting:</strong> Generated all new territory revenue through in-person cold calls to business owners, purchasing managers, and facilities decision-makers &mdash; 5.15% YOY growth on a $4.06M territory from prospecting discipline alone.</li>
    <li><strong>Incumbent Displacement at Scale:</strong> Systematically displaced established competitor brand relationships at multiple accounts through performance-based demonstrations, superior service commitment, and persistent relationship investment over multiple contact cycles.</li>
    <li><strong>Service-Oriented Account Retention:</strong> Maintained a high account retention rate by providing consistent in-person presence, rapid follow-through on commitments, and proactive communication &mdash; building account loyalty that makes competitor counter-calling ineffective.</li>
    <li><strong>Pipeline Execution:</strong> Managed a structured prospect-to-close pipeline, advancing cold contacts through qualification, value presentation, proposal, and contract stages with disciplined CRM accountability.</li>
  </ul>
</div>
<div class="job">
  <div class="job-title">Collections Administrator / Information Specialist &mdash; Digital Federal Credit Union (DCU)</div>
  <div class="job-company">Marlborough, MA &nbsp;&bull;&nbsp; October 2019 &ndash; September 2022</div>
  <ul>
    <li><strong>Quota Attainment:</strong> Exceeded monthly quotas by 10%, closing approximately 50 credit cards and 20 auto loans per month through consultative, needs-based selling and disciplined objection handling.</li>
    <li><strong>Persistence Through Objections:</strong> Developed strong skills in maintaining positive engagement across extended contact cycles and handling repeated objections from resistant prospects &mdash; directly applicable to the multi-touch prospect development model required to win uniform service contracts from satisfied incumbents.</li>
  </ul>
</div>
"""
make_pdf(wrap(HEADER_CHARLOTTE, body), "Collin_Celic_Resume_Vestis.pdf")


if __name__ == "__main__":
    print("\nAll 12 new resume PDFs generated successfully.")
