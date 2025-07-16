"""
Legal knowledge base for Indian laws and regulations
"""

LEGAL_KNOWLEDGE_BASE = {
    "tenant_rights": {
        "summary": "Tenant rights in India are governed by state-specific Rent Control Acts and the Model Tenancy Act 2021.",
        "key_rights": [
            "Right to peaceful enjoyment of the property",
            "Protection against arbitrary eviction",
            "Right to proper notice period (usually 30 days)",
            "Right to get security deposit back",
            "Protection against arbitrary rent increases"
        ],
        "applicable_laws": [
            "State Rent Control Acts",
            "Model Tenancy Act 2021",
            "Consumer Protection Act 2019"
        ],
        "common_issues": {
            "security_deposit": {
                "law": "Landlord must return deposit within 30 days minus legitimate deductions",
                "action": "Send legal notice, file complaint with rent controller"
            },
            "eviction_notice": {
                "law": "Minimum 30 days notice required, specific grounds needed",
                "action": "Challenge improper notice, seek legal advice"
            }
        }
    },
    "consumer_rights": {
        "summary": "Consumer rights are protected under the Consumer Protection Act 2019.",
        "key_rights": [
            "Right to safety",
            "Right to be informed",
            "Right to choose",
            "Right to be heard",
            "Right to seek redressal",
            "Right to consumer education"
        ],
        "complaint_process": [
            "Approach seller/service provider first",
            "File complaint with District Consumer Forum (up to ₹1 crore)",
            "Appeal to State Consumer Commission",
            "Final appeal to National Consumer Commission"
        ]
    },
    "labor_rights": {
        "summary": "Labor rights in India are governed by various acts including the new Labor Codes.",
        "key_rights": [
            "Right to minimum wage",
            "Right to 8-hour working day",
            "Right to overtime compensation",
            "Right to safe working conditions",
            "Protection against unfair dismissal",
            "Right to form unions"
        ],
        "new_labor_codes": [
            "Code on Wages 2019",
            "Industrial Relations Code 2020",
            "Code on Social Security 2020",
            "Occupational Safety Code 2020"
        ]
    },
    "rti_information": {
        "summary": "Right to Information Act 2005 empowers citizens to seek information from public authorities.",
        "process": [
            "Submit application to Public Information Officer (PIO)",
            "Pay application fee of ₹10",
            "Receive information within 30 days",
            "Appeal to First Appellate Authority if denied",
            "Final appeal to Information Commission"
        ],
        "exemptions": [
            "Information affecting national security",
            "Personal information",
            "Commercial confidence",
            "Parliamentary privilege"
        ]
    }
}

DOCUMENT_TEMPLATES = {
    "legal_notice": """
LEGAL NOTICE

To,
{recipient_name}
{recipient_address}

Subject: Legal Notice under {applicable_law}

Sir/Madam,

I, {sender_name}, resident of {sender_address}, hereby serve you this legal notice for the following reasons:

{notice_content}

You are hereby called upon to {demanded_action} within {time_period} days from the receipt of this notice, failing which I shall be constrained to initiate appropriate legal proceedings against you at your risk as to costs and consequences.

Take notice that if you fail to comply with the above demand within the stipulated time, I shall be left with no alternative but to approach the competent court of law for appropriate relief and damages.

Yours faithfully,
{sender_name}

Date: {date}
Place: {place}
""",
    
    "consumer_complaint": """
CONSUMER COMPLAINT

To,
The President,
{forum_name}
{forum_address}

Subject: Consumer Complaint under Consumer Protection Act, 2019

Respected Sir/Madam,

I, {complainant_name}, resident of {complainant_address}, hereby file this complaint against {opposite_party} for the following grievances:

{complaint_details}

The opposite party has committed deficiency in service/sold defective goods, causing me financial loss and mental agony.

I therefore pray that this Hon'ble Forum may:
1. {relief_sought_1}
2. {relief_sought_2}
3. Award compensation for mental agony and litigation costs

I am enclosing the following documents in support of my complaint:
{supporting_documents}

Thanking you,

{complainant_name}
Date: {date}
"""
}
