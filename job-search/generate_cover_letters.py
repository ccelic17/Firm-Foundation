"""
generate_cover_letters.py
Generates 25 cover letter PDFs (one per position) for Collin Celic's job search campaign.
All 25 positions are generated fresh, including the 13 that already have existing .md files.
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

HEADER = """
<div class="header">
  <h1>Collin Celic</h1>
  <div class="contact">
    ccelic17@gmail.com &nbsp;|&nbsp; (978) 512-2026 &nbsp;|&nbsp; linkedin.com/in/collin-celic<br>
    Relocating to Charlotte / Raleigh, NC &mdash; Available Immediately
  </div>
</div>
"""

OUTPUT_DIR = "/home/user/Firm-Foundation/job-search"


def make_cl_html(company, city_state, body_paragraphs, sign_name="Collin Celic"):
    paragraphs_html = "".join(f"<p>{p}</p>" for p in body_paragraphs)
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>{CSS_STYLES}</style></head><body>
{HEADER}
<div class="cl-date">June 15, 2026</div>
<div class="cl-addressee">
  Hiring Manager<br>
  {company}<br>
  {city_state}
</div>
<div class="cl-body">
  <p>Dear Hiring Manager,</p>
  {paragraphs_html}
</div>
<div class="cl-sign">
  Sincerely,<br>
  <strong>{sign_name}</strong><br>
  ccelic17@gmail.com &nbsp;|&nbsp; (978) 512-2026
</div>
</body></html>"""


def make_pdf(html, filename):
    path = f"{OUTPUT_DIR}/{filename}"
    HTML(string=html).write_pdf(path)
    print(f"  Generated: {filename}")
    return path


# ─────────────────────────────────────────────────────────────────────────────
# 1. STRYKER — SURGICAL TECHNOLOGIES (RALEIGH SOUTH)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Stryker &mdash; Surgical Technologies",
    "Raleigh, NC",
    [
        "Managing a $5.47M territory to 145% of quota during an industry-wide downturn is not a line on a resume &mdash; it is the single best preview of what I will do for a Stryker territory in Raleigh. I am writing because the Sales Representative role on the Surgical Technologies team is exactly the type of high-stakes, relationship-driven field position I have been building toward.",
        "My background at KraftMaid Cabinetry gave me full P&L responsibility across 23 accounts: territory planning with Salesforce and Power BI, consultative engagement with owner-operators and professional buyers, structured product education at every location, and the competitive discipline to grow market share while the industry contracted 8%. At TTI, I managed a $4.06M multi-brand territory (Milwaukee Tool, Ryobi, Ridgid) and delivered 5.15% year-over-year revenue growth through daily face-to-face field prospecting and in-person product demonstrations. These are not analogous experiences &mdash; they are the core mechanics of what a strong Stryker rep does, applied in a different vertical.",
        "I understand that Surgical Technologies is a different sales environment than consumer goods. But the skills Stryker actually evaluates in this role &mdash; persuasive product demonstrations in front of skeptical clinical professionals, competitive account displacement, disciplined CRM-driven territory management, and the resilience to keep performing in a high-pressure quota environment &mdash; are exactly what I bring. I am willing to earn my credibility in the OR context by studying the product line with the same intensity I applied to learning KraftMaid's 500-SKU catalog.",
        "I am relocating to Raleigh permanently and am prepared to start on your timeline with zero logistics delay. I want to be in the territory. I would welcome a conversation about what the Raleigh South opportunity requires and how I can meet that standard from day one.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Stryker_Surgical.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 2. STRYKER — NEUROVASCULAR ATM (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Stryker &mdash; Neurovascular",
    "Charlotte, NC",
    [
        "Growing market share in a declining market while hitting 145% of monthly quota is the kind of result that does not happen by accident &mdash; it comes from knowing how to manage a territory at the account level, earn trust with demanding buyers, and out-execute the competition in the field. That is the foundation I am bringing to Stryker's Associate Territory Manager role in Neurovascular Charlotte.",
        "As Territory Manager at KraftMaid Cabinetry, I held full accountability for a $5.47M annual portfolio across 23 accounts in greater Boston. I used Salesforce CRM and Power BI daily to prioritize field activity, track account-level KPIs, and identify growth opportunities. I delivered structured product demonstrations and business reviews across all 23 locations, built genuine advisory relationships with principal-level buyers, and grew market share while competitors retrenched. Before that, I managed a $4.06M multi-brand TTI territory and drove 5.15% year-over-year revenue growth through relentless daily field prospecting and in-person selling.",
        "Neurovascular is a sophisticated, clinically demanding product category, and I approach that honestly. I do not have a clinical background. What I bring is a field sales skill set that transfers directly: the ability to build trusted relationships with skeptical professional buyers, present complex products credibly and persuasively, manage a large territory through data-driven prioritization, and compete to win. I will put in the work to learn the clinical context because the product and the company are worth it.",
        "I am relocating to Charlotte with no timeline constraints and am available to start immediately. I would appreciate the opportunity to discuss the ATM role and how my territory track record translates to what you need in this market.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Stryker_Neurovascular.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 3. INSULET — TERRITORY MANAGER (RALEIGH WEST)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Insulet Corporation",
    "Raleigh, NC",
    [
        "A $5.47M territory plan built on Salesforce, structured account reviews, and 145% monthly quota attainment &mdash; that is the foundation I am bringing to the Territory Manager role at Insulet in Raleigh West. Insulet's Omnipod business demands a rep who can develop and execute a disciplined territory strategy, build trusted clinical partnerships, and sustain long-term account growth. Those are competencies I have been developing for four years.",
        "At KraftMaid Cabinetry, I was the sole field representative responsible for 23 high-volume accounts and $5.47M in annual revenue. I built a full territory business plan, managed it through Salesforce CRM and Power BI dashboards, and grew market share during an industry-wide 8% downturn by staying closer to my accounts than anyone else and delivering genuine value at every visit. I achieved 145% of monthly quota in January 2026. At TTI before that, I managed a $4.06M territory for Milwaukee Tool, Ryobi, and Ridgid &mdash; growing revenue 5.15% year-over-year through structured daily field activity and proactive stakeholder education.",
        "I recognize that moving into diabetes device sales from consumer goods requires me to learn a new clinical environment. I take that seriously and I am prepared to dedicate the time to understand the Omnipod technology, the patient journey, and the healthcare decision-making process in endocrinology and primary care. The core selling skills &mdash; territory planning, account strategy, consultative relationship building, and quota performance &mdash; are already in place.",
        "I am relocating to Raleigh immediately, with no constraints on start date. I would welcome the chance to discuss the Raleigh West territory and what a strong first year looks like for you.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Insulet.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 4. CARDINAL HEALTH — EXTENDED CARE (RALEIGH)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Cardinal Health",
    "Raleigh, NC",
    [
        "The Extended Care territory at Cardinal Health is a consultative sales role that lives or dies on account relationships, disciplined field coverage, and the ability to grow revenue inside a defined geography over time. I have been doing exactly that for four years, managing multimillion-dollar territories for companies that demand consistent performance, and I am ready to bring that track record to Raleigh.",
        "At KraftMaid Cabinetry, I held full revenue responsibility for a $5.47M portfolio across 23 accounts. I managed pricing conversations, handled service escalations, delivered structured product education, and grew market share during an industry-wide 8% contraction by deepening account partnerships and differentiating through service quality. I built my territory plan inside Salesforce CRM and Power BI, tracking account-level KPIs and optimizing my field time toward the highest-opportunity targets. The result: 145% of monthly quota in January 2026.",
        "What draws me to Cardinal Health's Extended Care business specifically is the account complexity. Selling to long-term care facilities, home health agencies, and extended care providers requires the same multi-stakeholder navigation I practiced daily with dealer principals, store managers, and buying groups &mdash; but with a mission that matters more. I am motivated by that, and I will bring the same consultative rigor I applied in consumer goods to understanding the purchasing dynamics and clinical needs of Cardinal's Extended Care customer base.",
        "I am relocating to Raleigh on a fixed timeline and available immediately. I would welcome the opportunity to discuss the territory and how my background maps to what you need.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Cardinal_Extended.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 5. CARDINAL HEALTH — OR PRODUCTS (RALEIGH/DURHAM)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Cardinal Health &mdash; OR Products",
    "Raleigh / Durham, NC",
    [
        "Five years of managing multimillion-dollar B2B territories has taught me one thing above all else: winning in the OR or winning on a dealer floor both come down to the same fundamentals &mdash; knowing your accounts deeply, showing up with more preparation than the competition, and making it easy for buyers to say yes. I am applying for the Sales Representative role on Cardinal Health's OR Products team because I am ready to apply that discipline in a higher-stakes clinical selling environment.",
        "In my most recent role at KraftMaid Cabinetry, I held full sales accountability for a $5.47M annual portfolio across 23 accounts. I used Salesforce CRM and Power BI to plan my territory, manage account health, and identify competitive displacement opportunities. I grew market share across multiple key accounts during an industry-wide 8% contraction and hit 145% of monthly quota in January 2026. At TTI, I drove 5.15% year-over-year revenue growth on a $4.06M multi-brand territory through daily face-to-face field activity and structured product demonstrations to buyer groups.",
        "I understand that OR product selling introduces a clinical dimension I have not yet worked in. I am approaching this transition directly: I am committed to learning the surgical environment, the procurement process, and the Cardinal OR product portfolio thoroughly before my first account call. What I bring immediately is the territory management infrastructure &mdash; Salesforce fluency, Power BI analytics, disciplined prospecting, and a track record of performing under quota pressure &mdash; that a strong OR rep also needs.",
        "I am relocating to the Triangle area without timeline constraints and can start immediately. I would appreciate the opportunity to discuss how my background fits the OR Products role and what your territory's current priorities look like.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Cardinal_OR.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 6. MEDTRONIC — PELVIC HEALTH (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Medtronic &mdash; Pelvic Health",
    "Charlotte, NC",
    [
        "Product demonstrations that convert skeptical professional audiences, territory planning driven by CRM data and Power BI analytics, and market share growth in a contracting market at 145% of monthly quota &mdash; these are the results I have delivered in B2B field sales. I am applying for the Sales Representative position in Medtronic's Pelvic Health division because the skills that produced those outcomes transfer directly to what a strong Medtronic rep does every day.",
        "At KraftMaid Cabinetry, I managed a $5.47M portfolio across 23 accounts in the Boston market, serving as the primary field representative responsible for revenue performance, account health, and competitive positioning. I delivered structured product education and live demonstrations across all 23 locations &mdash; training multi-level account teams on complex product features and performance applications. This mirrors the in-service and clinical education work that defines the Pelvic Health sales role. I built the territory through data-driven Salesforce and Power BI planning, grew market share while the industry contracted, and hit 145% of monthly quota in January 2026.",
        "I am not coming from a clinical sales background, and I want to be straightforward about that. What I bring is the complete field sales infrastructure &mdash; territory management, consultative relationship building, structured education delivery, and competitive performance &mdash; and the commitment to learn Medtronic's InterStim technology and the urology/urogynecology call environment with the same depth I applied to learning a complex product portfolio in consumer goods. The mission of Pelvic Health solutions &mdash; restoring quality of life for patients with overactive bladder and pelvic floor dysfunction &mdash; is something I find genuinely motivating.",
        "I am relocating to Charlotte immediately with no start date constraints. I would welcome a conversation about the Pelvic Health territory and what success looks like in year one.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Medtronic_Charlotte.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 7. MEDTRONIC — PELVIC HEALTH SR (RALEIGH)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Medtronic &mdash; Pelvic Health",
    "Raleigh, NC",
    [
        "In January 2026, I closed at 145% of monthly quota while managing a $5.47M territory through a sustained industry downturn. I did it by knowing my accounts better than anyone else, planning my territory with precision, and delivering product education that turned skeptical floor associates into engaged brand advocates. That is the kind of field rep I am, and that is the rep I want to be for Medtronic's Pelvic Health team in Raleigh.",
        "The Senior Sales Representative designation signals a need for someone who can operate independently, manage complex accounts, and drive meaningful revenue without heavy supervision. My four years of territory management experience &mdash; $5.47M at KraftMaid, $4.06M at TTI &mdash; have prepared me for exactly that. At KraftMaid, I was the sole representative for 23 accounts across greater Boston, responsible for everything from account health and pricing to in-person product demonstrations and CRM-tracked pipeline management. I grew market share in a declining market and exceeded quota through disciplined consultative selling. At TTI, I drove 5.15% YOY revenue growth on a high-activity daily field prospecting model.",
        "The Pelvic Health product line requires clinical knowledge I will need to develop, and I am approaching this honestly: I am committed to getting up the learning curve on InterStim Micro, the patient identification process, and the urology call environment quickly and thoroughly. What I bring immediately is the field sales infrastructure that makes a senior rep effective &mdash; Salesforce and Power BI fluency, territory planning discipline, a proven ability to build trust with demanding professional buyers, and the quota performance to back it up.",
        "I am relocating to Raleigh on a fixed timeline and am available to start immediately. I would welcome the opportunity to talk through the senior role and what you need from the territory right now.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Medtronic_Raleigh.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 8. EVOLUS — AEM (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Evolus",
    "Charlotte, NC",
    [
        "Selling a premium product to professional buyers who have every reason to stay with the incumbent takes more than a good pitch &mdash; it takes genuine relationship equity, a consultative approach, and the confidence to make the case on value rather than price. I built those skills managing a $5.47M premium product territory to 145% of monthly quota, and I am ready to apply them as an Aesthetic Experience Manager in Charlotte.",
        "Evolus's AEM role is fundamentally about building trusted practitioner partnerships, educating aesthetic professionals on the Jeuveau product line, and driving account adoption through consistent high-quality engagement &mdash; not just transactional selling. At KraftMaid Cabinetry, I held that exact type of relationship with 23 accounts across greater Boston: I was the primary point of contact for dealer principals and design professionals who had high standards, many alternatives, and no obligation to give me the sale. I earned the business repeatedly by understanding their needs better than my competitors did and by delivering structured product demonstrations and training that made their teams more effective. I grew market share during an industry-wide 8% downturn.",
        "At TTI, I conducted live product demonstrations for professional tool buyers &mdash; making the case for premium brands against lower-priced incumbents through performance-based comparison selling. That is not categorically different from an AEM presenting Jeuveau's clinical profile and practice economics to a skeptical injector who already has a BOTOX contract. The selling motion translates directly.",
        "I am relocating to Charlotte without timeline constraints and am available to begin immediately. Evolus's culture of ambitious, relationship-driven growth is exactly the environment I perform best in. I would welcome the chance to connect.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Evolus_Charlotte.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 9. EVOLUS — AEM (RALEIGH)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Evolus",
    "Raleigh, NC",
    [
        "The best aesthetic reps I have studied are not order-takers &mdash; they are practice partners who help injectors grow their business while growing the Evolus revenue line simultaneously. That consultative, partnership-first approach is exactly what I developed managing a $5.47M territory across 23 accounts, and it is what I want to bring to Raleigh as an Aesthetic Experience Manager.",
        "At KraftMaid Cabinetry, I built trusted advisory relationships with dealer principals, designers, and professional buyers by showing up prepared, educating their teams thoroughly, and consistently delivering value that went beyond the transaction. I converted skeptical accounts into loyal brand advocates during a period when the industry was contracting 8% &mdash; which required genuine consultative skill, not just persistence. I achieved 145% of monthly quota in January 2026 by knowing which accounts to prioritize, how to position the product against competitive objections, and when to close. Before that, at TTI, I persuaded professional buyers to switch from entrenched brand relationships through performance-based demonstrations &mdash; a skillset that maps directly to AEM selling.",
        "Aesthetic injectable sales carries a clinical dimension I will need to develop, and I am approaching that proactively. I am already studying Jeuveau's clinical profile, onset characteristics, and practice economics so that my first account conversation can center on their business, not my learning curve. My commitment is to earn my credibility in this space through preparation, not shortcuts.",
        "I am relocating to Raleigh immediately with no start date constraints. I would love the opportunity to discuss how my consultative B2B track record translates to the Evolus AEM role in this market.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Evolus_Raleigh.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 10. ALLERGAN AESTHETICS (RALEIGH)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Allergan Aesthetics (AbbVie)",
    "Raleigh, NC",
    [
        "Allergan Aesthetics has built the most recognized aesthetic portfolio in the world, and the Aesthetic Surgical Representative role is a position where territory relationships, brand conviction, and consultative selling skill matter more than almost any other factor. Those are the areas where I have been performing at a high level for four years &mdash; and I am ready to earn a place on your Raleigh team.",
        "At KraftMaid Cabinetry, I managed a $5.47M premium product portfolio across 23 accounts, selling to professional buyers who could always choose a lower-price alternative. Winning those accounts required deep product knowledge, a consultative approach that prioritized the account's business outcomes over short-term transaction pressure, and the confidence to position against price objections with evidence-based value. I grew market share in a contracting market and hit 145% of monthly quota in January 2026. At TTI, I made the case for premium tool brands against entrenched lower-priced incumbents through live product demonstrations &mdash; a selling motion I see clearly reflected in Allergan's competitive landscape.",
        "I recognize that selling the BOTOX and Juvederm portfolio requires clinical product knowledge and an understanding of the aesthetics practice environment that I have not yet acquired professionally. I am treating that as an investment, not an obstacle: I am studying the product line, the competitive set, and the aesthetic practice economics so that when I walk into a Raleigh injector's office, I can have a business conversation, not a learning conversation. The core sales capabilities &mdash; relationship equity, consultative closing, territory planning, quota discipline &mdash; are already in place.",
        "I am relocating to Raleigh without timeline constraints and am available to start immediately. I would welcome the opportunity to discuss the Aesthetic Surgical Representative role and how my background maps to what Allergan needs in this territory.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Allergan.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 11. CINTAS (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Cintas Corporation",
    "Charlotte, NC",
    [
        "Daily cold prospecting, new account development from a cold start, and the discipline to keep a full pipeline while managing an existing book of business &mdash; this is the Cintas Sales Representative's job in Charlotte, and it is the job I am built for. I spent four years in high-activity field sales roles where income was earned through prospecting discipline and competitive closing, and I am ready to channel that into a Cintas territory.",
        "At KraftMaid Cabinetry, I held full B2B sales responsibility for 23 accounts and a $5.47M annual portfolio. I used Salesforce CRM and Power BI to manage my pipeline and territory routing, hit 145% of monthly quota in January 2026, and grew market share in a market that was contracting 8% industry-wide &mdash; by displacing entrenched competitor relationships through consistent presence and competitive selling. At TTI, I drove 5.15% year-over-year revenue growth on a $4.06M territory through daily face-to-face cold calls and in-store prospecting across a defined geography. Before that, at DCU, I exceeded monthly quotas by 10% in a high-volume phone-based sales environment &mdash; closing 50 credit products and 20 auto loans per month through consultative, objection-handling-heavy selling.",
        "Cintas's sales culture is built on activity, accountability, and competitive new account acquisition. I have lived in that culture. I understand that results are a product of daily field activity logged in CRM, prospects moved through a structured pipeline, and the discipline to make the next call even after a hard no. I thrive in that environment.",
        "I am relocating to Charlotte immediately with no timeline constraints and am ready to start prospecting the day I land. I would welcome the opportunity to talk about what the Charlotte territory needs from a new rep right now.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Cintas.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 12. HENRY SCHEIN (RALEIGH)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Henry Schein",
    "Raleigh, NC",
    [
        "Analytics-backed account reviews, Power BI territory dashboards, and a consultative approach that converts data into account-level revenue growth &mdash; this is how I built a $5.47M territory to 145% of monthly quota, and it is the exact approach Henry Schein's Sales Specialist role demands. I am applying because the combination of analytical rigor and field relationship skills required here matches my background closely.",
        "At KraftMaid Cabinetry, I conducted structured business reviews with dealer principals and key buyers, using Power BI dashboards and Salesforce CRM to identify revenue gaps, growth opportunities, and competitive risk across 23 accounts. I built account-specific action plans, delivered product training that improved sell-through, and protected market share in a declining industry by staying more analytically prepared than the competition at every account review. At TTI, I managed a $4.06M multi-brand territory and grew revenue 5.15% year-over-year by combining high-frequency face-to-face engagement with disciplined pipeline tracking in CRM.",
        "Henry Schein's business &mdash; distributing dental and medical supplies to practices across North Carolina and South Carolina &mdash; is fundamentally a territory business where account depth, data-driven planning, and consistent consultative service create competitive advantage. I bring the tools and the track record to operate at that level. The product context is new; the operating model is familiar.",
        "I am relocating to Raleigh without timeline constraints and am available immediately. I would welcome the chance to discuss the Sales Specialist opportunity and how an analytics-first territory approach can add value to the Raleigh market.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Henry_Schein.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 13. PATTERSON COMPANIES (NC)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Patterson Companies",
    "North Carolina",
    [
        "Territory sales at Patterson lives on the same mechanics I have been executing for four years: structured account reviews with practice owners, consistent face-to-face field coverage, product education that creates pull-through, and the account trust that makes you the rep they call first. I am applying for the Territory Sales Representative role at Patterson because those are the skills I bring, and North Carolina is where I am relocating immediately.",
        "At KraftMaid Cabinetry, I managed a $5.47M annual portfolio across 23 accounts as the sole field representative. I conducted account business reviews, analyzed performance data with Power BI and Salesforce, and jointly built growth plans with dealer principals to protect share and identify incremental revenue opportunities. I delivered product training at every account &mdash; converting multi-level teams from passive stockers to informed advocates. This mirrors exactly how Patterson's best reps operate in a dental or medical practice territory. I achieved 145% of monthly quota in January 2026 and grew market share while the industry contracted 8%.",
        "At TTI, I managed a $4.06M multi-brand territory (Milwaukee Tool, Ryobi, Ridgid) and delivered 5.15% YOY revenue growth through daily in-person prospecting, product demonstrations for buyer groups, and disciplined new account development. The cadence of showing up, adding value, and consistently expanding the relationship is the same cadence that builds a Patterson territory.",
        "I am relocating to North Carolina with no constraints on start date and am available immediately. I would welcome the opportunity to discuss the territory and how my background translates to Patterson's customer relationships and sales model.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Patterson.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 14. ADP — ENTRY LEVEL OUTSIDE SALES (RALEIGH)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "ADP",
    "Raleigh, NC",
    [
        "Hunting new business in a defined territory, cold prospecting small-to-medium businesses every day, and building pipeline from scratch through disciplined outbound activity &mdash; this is the ADP Outside Sales model in Raleigh, and it is the model I have been executing for four years. I am applying because ADP's territory structure and new business hunting culture align exactly with how I sell.",
        "At KraftMaid Cabinetry, I held full revenue accountability for 23 accounts and a $5.47M territory in greater Boston. I used Salesforce CRM to manage my pipeline, built my territory call plan around high-opportunity targets, and exceeded quota &mdash; hitting 145% of monthly target in January 2026 &mdash; by combining consistent field activity with consultative closing. At TTI, I drove 5.15% year-over-year revenue growth on a $4.06M territory through daily cold prospecting to business owners and purchasing decision-makers. At DCU, I closed 50+ financial products per month through phone-based consultative selling &mdash; including discovery, objection handling, needs-based positioning, and close. Every role I have held has been quota-driven, prospecting-first, and activity-accountable.",
        "ADP's payroll and HR solutions target the exact buyer profile I have always called on: business owners and operators who are busy, cost-conscious, and resistant to change. The consultative approach &mdash; lead with their pain, connect the solution to their business outcome, handle objections, and close &mdash; is second nature to me. I understand I will need to learn the ADP product suite and the specific regulatory landscape of SMB payroll, and I am prepared to do that with the same intensity I brought to learning product lines in every previous role.",
        "I am relocating to Raleigh immediately and am available to start without delay. I would welcome a conversation about the Raleigh territory and what a strong first 90 days looks like for an ADP rep in this market.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_ADP_Raleigh.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 15. ADP — ENTRY LEVEL OUTSIDE SALES (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "ADP",
    "Charlotte, NC",
    [
        "The first ninety days in an ADP territory are about one thing: how many qualified conversations can you create with business owners who do not currently know they need ADP? I have been answering that question for four years across multimillion-dollar territories &mdash; and my answer has always been: more than quota requires. I am applying for the Entry Level Outside Sales role in Charlotte because this territory is exactly the environment where my prospecting-first skill set will produce results.",
        "At TTI, I built daily new business cadence across a $4.06M multi-brand territory &mdash; cold-calling buyer decision-makers, building relationships from scratch with accounts that had no existing brand preference, and converting that activity into 5.15% year-over-year revenue growth. At KraftMaid, I managed 23 established accounts while simultaneously developing new opportunities within the portfolio &mdash; growing market share during an industry contraction by staying more active and more prepared than competing reps. I achieved 145% of monthly quota in January 2026 through a combination of high-frequency activity and disciplined pipeline management inside Salesforce CRM.",
        "Selling payroll and HR solutions to small businesses with 1&ndash;49 employees is a volume prospecting game: high call activity, efficient qualification, fast objection handling, and consistent follow-through. My DCU experience adds another dimension here &mdash; I closed 50+ financial products per month via phone-based consultative selling to consumers who had not intended to buy when the call started. That experience in rapid-cycle closing from a cold start applies directly to ADP's SMB prospecting model.",
        "I am relocating to Charlotte with no timeline constraints and can start immediately. The uncapped commission structure and the opportunity to build a book of business in a growing market are exactly what I am looking for. I would welcome the chance to discuss the Charlotte territory and what you need from a rep to make 2026 the strongest year this market has seen.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_ADP_Charlotte.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 16. ADP — ACCOUNT EXECUTIVE (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "ADP",
    "Charlotte, NC",
    [
        "Managing a $5.47M portfolio to 145% of monthly quota in a declining market is the kind of quota track record that qualifies a rep for a strategic account responsibility &mdash; which is why I am applying for the Account Executive role at ADP in Charlotte rather than the entry-level position. I bring a proven B2B quota history, a Salesforce-driven territory management approach, and the consultative closing experience to compete at the AE level.",
        "At KraftMaid Cabinetry, I held full strategic account management responsibility for 23 accounts and $5.47M in annual revenue. I conducted structured business reviews with decision-makers, built joint growth plans with principal-level buyers, managed contract and pricing discussions, and used Power BI dashboards to track performance and identify expansion opportunities. I grew market share while the industry contracted 8% and hit 145% of monthly quota through disciplined consultative engagement. At TTI, I managed a $4.06M territory with multiple brand lines and multiple stakeholder levels at each account, coordinating across managers, buyers, and operations contacts to drive 5.15% YOY revenue growth.",
        "ADP's Account Executive role requires the ability to manage strategic accounts, present complex solutions to multi-stakeholder buying groups, and close larger, longer-cycle opportunities. My experience managing 23 accounts across greater Boston &mdash; each with multiple contacts, competing priorities, and budget cycles &mdash; is directly relevant. The product domain is HCM and payroll rather than consumer goods, and I will invest in understanding the ADP suite with the same depth I brought to every product line I have represented.",
        "I am relocating to Charlotte immediately and am available to start without delay. The strategic account scope of the AE role and the OTE ceiling at ADP are the right match for where I am in my career. I would welcome the opportunity to make the case for that in a conversation.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_ADP_AccountExec.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 17. PAYCHEX — SALES CONSULTANT (RALEIGH)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Paychex",
    "Raleigh, NC",
    [
        "Consultative selling to business owners through a mix of field days, referral relationship cultivation, and structured pipeline management &mdash; this is the Paychex Sales Consultant model, and it maps precisely to the way I have operated for four years. I am applying because Paychex's focus on consultative HR and payroll solutions, combined with the Raleigh market opportunity, is the right next step for my career.",
        "At KraftMaid Cabinetry, I built my territory through a combination of managing existing accounts and developing new referral relationships with store leadership, buyers, and dealer principals. I ran structured account reviews, identified unmet needs through consultative discovery, and built the kind of trusted advisor relationships where clients called me before calling a competitor. I managed the territory through Salesforce CRM and Power BI, maintained full pipeline visibility, and achieved 145% of monthly quota in January 2026. At DCU, I sold consultatively in a high-compliance, high-volume financial environment &mdash; the exact kind of regulated, trust-dependent selling context that Paychex's HR and payroll business operates in.",
        "Paychex's channel model &mdash; with referral relationships from CPAs, bankers, and benefits brokers alongside direct prospecting &mdash; rewards reps who can cultivate multiple relationship tracks simultaneously. My experience managing 23 accounts while also prospecting new business and maintaining referral sources is directly relevant. The compliance dimension of payroll and HR adds a layer I will need to learn, and I am prepared to invest in that education fully.",
        "I am relocating to Raleigh immediately with no start date constraints. Three field days per week minimum is the expectation I am built for. I would welcome the opportunity to discuss the Sales Consultant role and what the Raleigh territory's pipeline looks like right now.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Paychex.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 18. CULLIGAN QUENCH — FIELD ACCOUNT EXECUTIVE (RALEIGH)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Quench (Culligan)",
    "Raleigh, NC",
    [
        "I have been specifically targeting the Culligan Quench territory in Raleigh because the role is one of the strongest matches I have found in this market: B2B face-to-face prospecting, new account acquisition from a cold start, a recurring-revenue service model, and a territory structure that rewards the kind of daily field discipline I have been executing for four years. I am writing to make the case that I am the right fit for this Field Account Executive role.",
        "At KraftMaid Cabinetry, I managed a $5.47M territory across 23 accounts in greater Boston, responsible for every dollar of revenue in the geography. I combined ongoing account management with active new business prospecting &mdash; cold-calling buyers, qualifying decision-makers, and converting cold accounts into revenue contributors while protecting my existing base. I hit 145% of monthly quota in January 2026 and grew market share during an industry-wide 8% contraction. At TTI, I drove 5.15% year-over-year growth on a $4.06M multi-brand territory through daily in-person cold prospecting to business owners and purchasing managers &mdash; exactly the buyer profile Quench's Field AE targets.",
        "The Quench business model &mdash; selling water hydration solutions to offices, manufacturing facilities, and commercial spaces on a recurring service contract &mdash; is particularly appealing to me because the value proposition is simple, the ROI is clear, and the selling is about trust and territory coverage rather than complex technical sales. My experience building account relationships from zero, managing a defined geography efficiently with CRM, and executing consistent daily field activity is exactly what generates results in this model.",
        "I am relocating to Raleigh immediately with no timeline constraints. I am ready to hit the territory on day one. I would welcome the opportunity to discuss what the Raleigh Field Account Executive role requires and how I can make an immediate impact.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Culligan_Quench.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 19. UNIFIRST — OUTSIDE SALES (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "UniFirst Corporation",
    "Charlotte, NC",
    [
        "The UniFirst Outside Sales Representative model is built on high-volume cold prospecting, persistent new account development, and the competitive hunger to take business from incumbent service providers. That is a description of how I have built revenue for four years, and it is exactly the operating mode I am looking for in Charlotte.",
        "At TTI, I drove new business growth on a $4.06M multi-brand territory through daily cold calls to business owners, department managers, and purchasing decision-makers &mdash; converting accounts that had no prior brand relationship into consistent revenue contributors. I delivered live product demonstrations, handled objections against established incumbent brands, and grew the territory 5.15% year-over-year. At KraftMaid, I combined active new business prospecting with management of an existing $5.47M portfolio, and exceeded quota &mdash; hitting 145% in January 2026 &mdash; during a period of industry contraction. At DCU, I closed 50+ financial products per month in a cold-outreach, high-compliance environment, developing the objection handling and rapid-cycle closing skills that transfer directly to UniFirst's prospecting model.",
        "The uniform and workwear services business &mdash; with long contract cycles, competitive displacement selling, and a service-dependent recurring revenue model &mdash; rewards reps who are persistent, relationship-driven, and willing to make the call that their competitor has been skipping. I am that rep. I use Salesforce CRM to manage pipeline and track daily activity, and I understand that results in this business are a function of contact frequency and follow-through discipline over time.",
        "I am relocating to Charlotte immediately with no start date constraints and am ready to begin prospecting the territory on day one. The base plus uncapped commission structure at UniFirst is the right environment for my skill set. I would welcome the opportunity to discuss the Charlotte territory in more detail.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_UniFirst_Charlotte.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 20. UNIFIRST — OUTSIDE SALES (RALEIGH-DURHAM)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "UniFirst Corporation",
    "Raleigh-Durham, NC",
    [
        "When a business switches its uniform service provider, they are not switching on price alone &mdash; they are switching because a rep showed up consistently, built trust, and made a compelling enough case to justify the disruption. Building that kind of competitive account displacement is what I do, and it is why I am applying for the Outside Sales Representative role at UniFirst in Raleigh-Durham.",
        "At KraftMaid Cabinetry, I grew market share during an industry-wide 8% downturn by displacing entrenched competitor relationships through superior service, consultative engagement, and a consistent field presence that my competitors stopped providing. I hit 145% of monthly quota in January 2026 on a $5.47M territory, managing everything from cold prospecting and discovery through contract negotiation and long-term account management. At TTI, I convinced professional buyers to switch from established tool brands by making the performance case in person, live, in front of the product &mdash; 5.15% YOY growth on a $4.06M territory through daily face-to-face competitive selling.",
        "Raleigh-Durham is one of the fastest-growing business corridors in the Southeast, which means a growing supply of uncontracted and dissatisfied accounts that are open to switching. I want to be the UniFirst rep calling on those businesses. My Salesforce-driven pipeline management, daily prospecting discipline, and competitive new account closing track record are the right tools for that opportunity.",
        "I am relocating to the Triangle area immediately with no constraints on start date. I would welcome the chance to discuss the Raleigh-Durham territory and what winning looks like for UniFirst in this market.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_UniFirst_Raleigh.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 21. SYSCO — SALES CONSULTANT (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Sysco",
    "Charlotte, NC",
    [
        "Managing a territory that combines new account development with deep existing account penetration is a selling model I know well. At Sysco, the Sales Consultant role in Charlotte requires exactly that: prospecting new restaurants, hotels, and institutions while growing wallet share inside an established book of business &mdash; and doing it with the consistency and relationship discipline that makes a distributor rep the first call when something goes wrong. That is the rep I am.",
        "At KraftMaid Cabinetry, I managed a $5.47M portfolio across 23 B2B accounts &mdash; splitting my time between deepening existing relationships through structured business reviews and identifying new opportunities for incremental revenue within and beyond the current account set. I grew market share in a declining market by being more present, more consultative, and more accountable than competing reps. I hit 145% of monthly quota in January 2026 through a combination of account penetration discipline and targeted new business development. At TTI, I drove 5.15% YOY growth on a $4.06M territory through daily in-person field activity and consistent account engagement.",
        "Foodservice distribution adds a logistics and supply chain dimension I will need to develop. I am approaching that practically: I understand that a Sysco rep's credibility is built on product knowledge, reliability, and the ability to solve supply problems before the chef calls to complain. I will invest in learning the Sysco product catalog, the Charlotte foodservice market, and the operational realities of restaurant purchasing with the same intensity I brought to learning complex product lines in prior roles.",
        "I am relocating to Charlotte immediately with no start date constraints. The opportunity to build a Sysco territory in a growing culinary market is compelling, and I am ready to earn the results. I would welcome the chance to discuss the Sales Consultant role and what success looks like in Charlotte.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Sysco.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 22. BOSTON SCIENTIFIC — TERRITORY EXECUTIVE, UROLOGY / eCOIN (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Boston Scientific &mdash; Urology (eCoin)",
    "Charlotte, NC",
    [
        "A $5.47M territory managed through disciplined Salesforce planning, structured product demonstrations to professional buyers, and 145% monthly quota attainment in a declining market &mdash; this is the B2B field sales track record I am bringing to Boston Scientific's Territory Executive role in urology. I understand the eCoin is a sophisticated implantable device requiring clinical credibility, and I am pursuing this role with both eyes open: the sales infrastructure is in place; the clinical context is the investment I am committing to make.",
        "At KraftMaid Cabinetry, I held sole field responsibility for 23 accounts and a $5.47M annual portfolio. I delivered structured product education and live demonstrations across all 23 locations, built trusted advisory relationships with principal-level buyers who had high standards and many alternatives, and grew market share while the broader market contracted 8%. I managed the territory through Salesforce CRM and Power BI analytics, using data to prioritize account coverage and identify growth opportunities. At TTI, I managed a $4.06M multi-brand territory and drove 5.15% YOY revenue growth through daily face-to-face field engagement and competitive product demonstrations.",
        "The eCoin implant for overactive bladder is a procedure-enabling device &mdash; which means the sales motion is about educating urologists and urogynecologists on patient identification, procedure technique, and reimbursement pathway, then building the account infrastructure to drive consistent case volume. I recognize that the clinical selling environment at Boston Scientific is more demanding than anything I have encountered to date. I will be honest: I am applying because the product genuinely interests me, the company's reputation for device quality is unmatched, and I am willing to do the work to earn credibility in the urology call environment through product study, shadowing, and preparation.",
        "I am relocating to Charlotte immediately with no start date constraints. The OTE at this level is significant, and I understand that the clinical complexity is the reason. I believe the investment is worth making. I would welcome the opportunity to discuss the Territory Executive role and what Boston Scientific needs from a rep in Charlotte right now.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Boston_Scientific.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 23. OLYMPUS — TERRITORY MANAGER, ENDOTHERAPY (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Olympus",
    "Charlotte, NC",
    [
        "Olympus's endotherapy territory in Charlotte requires a rep who can build relationships with gastroenterologists and GI lab staff, conduct in-services on complex endoscopic devices, and manage a clinical account base with the attention and professionalism that medical device selling demands. I am applying because the field sales competencies that role requires &mdash; consultative relationship building, structured product education to professional audiences, and disciplined territory management &mdash; are the same competencies I have been executing at a high level in B2B outside sales.",
        "At KraftMaid Cabinetry, I delivered structured product demonstrations and education sessions across 23 professional buyer accounts, converting skeptical stakeholders into engaged brand advocates through preparation, credibility, and consistent follow-through. I managed a $5.47M territory through Salesforce CRM and Power BI analytics, built account-specific business plans with principal-level buyers, and grew market share in a declining industry. I hit 145% of monthly quota in January 2026. At TTI, I demonstrated complex product features to professional buyer audiences daily &mdash; making the case for technical differentiation in a head-to-head competitive selling environment.",
        "I am approaching the clinical dimension of this role with honesty and respect for the environment. Endotherapy involves a high level of technical product knowledge and procedural context that I do not yet have. What I bring is the field sales foundation that a good Olympus rep builds on: relationship discipline, territory planning skills, presentation confidence, and the accountability to perform under quota pressure. I am committed to learning the endoscopy product line and the GI lab environment with the same depth I applied to every product portfolio I have represented.",
        "I am relocating to Charlotte immediately with no start date constraints. I would welcome the opportunity to discuss the Territory Manager role and what Olympus needs from the Charlotte endotherapy territory right now.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Olympus.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 24. FASTENAL — OUTSIDE SALES (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Fastenal",
    "Charlotte, NC",
    [
        "Face-to-face prospecting to manufacturing, construction, and industrial accounts &mdash; walking in the door, qualifying the right decision-maker, and building the kind of on-site relationships that make you the supplier they call before they check anyone else &mdash; this is Fastenal's field sales model in Charlotte, and it is an environment where my background in high-activity B2B territory sales will translate directly.",
        "At TTI, I was on the floor of construction supply stores and industrial accounts every day &mdash; cold-calling buyers, building relationships with department managers, and driving new business through in-person engagement with decision-makers who had no shortage of competing sales reps walking in behind me. I drove 5.15% year-over-year revenue growth on a $4.06M territory by being more prepared, more present, and more useful than the competition. At KraftMaid, I managed 23 B2B accounts and a $5.47M portfolio, combining active new business prospecting with disciplined account management &mdash; hitting 145% of monthly quota in January 2026 during a market contraction.",
        "Fastenal's industrial/MRO customer base &mdash; manufacturers, contractors, and operations buyers who care about supply reliability, price, and relationship trust above all else &mdash; is a buyer profile I understand from years of calling on professional trade accounts. I use Salesforce CRM to manage territory activity and pipeline, and I know how to structure a call plan that covers the geography without leaving opportunity uncalled. The industrial product context is one I will learn quickly; the field selling skills are already in place.",
        "I am relocating to Charlotte immediately with no start date constraints. Fastenal's reputation for promoting from within and rewarding performance-based territory development is exactly the career structure I am looking for. I would welcome the opportunity to discuss the Outside Sales role and what the Charlotte territory's growth priorities look like.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Fastenal.pdf")

# ─────────────────────────────────────────────────────────────────────────────
# 25. VESTIS (ARAMARK UNIFORMS) — SALES REPRESENTATIVE (CHARLOTTE)
# ─────────────────────────────────────────────────────────────────────────────
html = make_cl_html(
    "Vestis (Aramark Uniform Services)",
    "Charlotte, NC",
    [
        "Vestis is competing directly against Cintas and UniFirst for every uniform account in Charlotte, which means the sales rep who wins in this market is the one who prospects harder, shows up more consistently, and makes a more compelling case for switching. That competitive dynamic is exactly the environment where I perform best &mdash; and why I am applying for the Sales Representative role at Vestis.",
        "At KraftMaid Cabinetry, I grew market share in a contracting market by displacing entrenched competitor relationships through superior account service, consistent presence, and a consultative approach that understood the account's business before making the pitch. I hit 145% of monthly quota in January 2026 on a $5.47M territory. At TTI, I cold-prospected business owners and purchasing decision-makers daily, driving 5.15% year-over-year revenue growth on a $4.06M territory by making the case for my brands against established incumbents. At DCU, I exceeded monthly quotas by 10% through high-volume consultative selling with strong objection handling in a competitive, high-compliance environment.",
        "The Vestis sales model &mdash; recurring service contracts with long-term business customers in manufacturing, healthcare, food service, and hospitality &mdash; rewards reps who are methodical, persistent, and genuinely relationship-driven. Switching a uniform service provider is a significant operational decision for a business owner; the rep who earns the switch is the one who stayed in front of the account long enough and consistently enough to make the relationship undeniable. That is exactly the kind of long-game territory development I have proven I can execute.",
        "I am relocating to Charlotte immediately with no start date constraints. The opportunity to build a Vestis territory in one of the Southeast's fastest-growing business markets is compelling, and I am ready to get started. I would welcome the chance to discuss the Sales Representative role and what the Charlotte market needs from a new rep right now.",
    ]
)
make_pdf(html, "Collin_Celic_CoverLetter_Vestis.pdf")


if __name__ == "__main__":
    print("\nAll 25 cover letter PDFs generated successfully.")
