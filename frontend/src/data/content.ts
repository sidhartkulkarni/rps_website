// Public content transcribed from docs/legacy-audit, status=1 only.
// Editorial instructions, placeholder legal bodies and unrelated locations excluded.
export interface ContentBlock { kind: 'paragraph' | 'item'; text: string }
export interface CmsSection { id: number; name: string; title: string; body: ContentBlock[]; extra: ContentBlock[]; image: string }
export interface PackagingCategory { id: number; title: string; body: ContentBlock[]; extra: ContentBlock[] }
export interface Testimonial { id: number; name: string; rating: number; body: ContentBlock[] }
export interface Benefit { id: number; title: string; body: ContentBlock[]; image: string }

export const cms: Record<number, CmsSection> = {
  "1": {
    "id": 1,
    "name": "English Video",
    "title": "",
    "body": [],
    "extra": [],
    "image": ""
  },
  "2": {
    "id": 2,
    "name": "Spanish Video",
    "title": "",
    "body": [],
    "extra": [],
    "image": ""
  },
  "3": {
    "id": 3,
    "name": "OUR STORY",
    "title": "About Rapid Pack N Ship",
    "body": [
      {
        "kind": "paragraph",
        "text": "Rapid Pack N Ship was founded to address a clear and pressing problem. Traditional shipping companies often fail to understand the needs of auction buyers. Auctions move fast, involve unpredictable items, and demand careful handling."
      }
    ],
    "extra": [],
    "image": "/uploads/cms/about-main176367930880.png"
  },
  "4": {
    "id": 4,
    "name": "Our Services",
    "title": "Reliable Shipping Solutions",
    "body": [],
    "extra": [],
    "image": ""
  },
  "5": {
    "id": 5,
    "name": "WHY CHOOSE US",
    "title": "The Smarter Shipping Choice",
    "body": [
      {
        "kind": "paragraph",
        "text": "At Rapid Pack N Ship, we combine speed, affordability, and exceptional service, delivering auction items quickly and reliably, so you save time, maximize profits, and enjoy stress-free shipping."
      }
    ],
    "extra": [],
    "image": "/uploads/cms/story-1176375063574.png"
  },
  "6": {
    "id": 6,
    "name": "Get In Touch",
    "title": "Reach us today for fast support",
    "body": [],
    "extra": [],
    "image": ""
  },
  "7": {
    "id": 7,
    "name": "Footer Content",
    "title": "",
    "body": [
      {
        "kind": "paragraph",
        "text": "*In areas currently served by RPS you Must contract with RPS within five working days from the last pick up date*"
      }
    ],
    "extra": [],
    "image": ""
  },
  "8": {
    "id": 8,
    "name": "OUR STORY",
    "title": "About Rapid Pack N Ship",
    "body": [
      {
        "kind": "paragraph",
        "text": "Rapid Pack N Ship was founded to address a clear and pressing problem. Traditional shipping companies often fail to understand the needs of auction buyers. Auctions move fast, involve unpredictable items, and demand careful handling. Yet many buyers face:"
      },
      {
        "kind": "item",
        "text": "Late fees or abandonment of items if they are not picked up in time"
      },
      {
        "kind": "item",
        "text": "Items arriving damaged due to careless packaging"
      },
      {
        "kind": "item",
        "text": "Inflated shipping quotes from carriers unfamiliar with auctions"
      },
      {
        "kind": "item",
        "text": "Weeks of waiting before items are delivered"
      },
      {
        "kind": "item",
        "text": "Little or no communication during the process"
      },
      {
        "kind": "paragraph",
        "text": "We knew there had to be a better way."
      },
      {
        "kind": "paragraph",
        "text": "Our founders, combining their backgrounds in logistics, transportation, and packaging design, built a service dedicated exclusively to auction buyers. Today, we serve customers across the United States and internationally, providing fast, affordable, and reliable auction shipping."
      }
    ],
    "extra": [],
    "image": "/uploads/cms/about-main1176367962046.png"
  },
  "9": {
    "id": 9,
    "name": "Our Vision",
    "title": "Shaping the Future of Shipping",
    "body": [
      {
        "kind": "paragraph",
        "text": "To become the global standard for auction shipping services, trusted by buyers, auction houses, and businesses for our professionalism, expertise, and customer-first approach."
      }
    ],
    "extra": [],
    "image": "/uploads/cms/vision176367964550.png"
  },
  "10": {
    "id": 10,
    "name": "Our Mission",
    "title": "Committed to Smarter Shipping",
    "body": [
      {
        "kind": "paragraph",
        "text": "To empower auction buyers by providing secure packaging, transparent pricing, and efficient shipping services that ensure every win arrives on time and in perfect condition."
      }
    ],
    "extra": [],
    "image": "/uploads/cms/mission176367969746.png"
  },
  "11": {
    "id": 11,
    "name": "Our Core Values",
    "title": "",
    "body": [
      {
        "kind": "item",
        "text": "Integrity: We keep our promises and deliver on commitments"
      },
      {
        "kind": "item",
        "text": "Speed: We move as quickly as the auctions themselves"
      },
      {
        "kind": "item",
        "text": "Care: Every item is packaged as if it were our own items"
      },
      {
        "kind": "item",
        "text": "Affordability: We provide world class service at competitive rates"
      },
      {
        "kind": "item",
        "text": "Communication: We ensure clients are updated every step of the way"
      }
    ],
    "extra": [],
    "image": "/uploads/cms/corevalue176367972158.png"
  },
  "12": {
    "id": 12,
    "name": "Why Clients Trust Us",
    "title": "",
    "body": [
      {
        "kind": "item",
        "text": "Decades of combined experience in logistics"
      },
      {
        "kind": "item",
        "text": "Thousands of successfully shipped auction items annually"
      },
      {
        "kind": "item",
        "text": "Proven track record of safe and on time deliveries"
      },
      {
        "kind": "item",
        "text": "Partnerships with top carriers worldwide"
      }
    ],
    "extra": [],
    "image": "/uploads/cms/client-trust176367974411.webp"
  },
  "13": {
    "id": 13,
    "name": "our services",
    "title": "Reliable Shipping Solutions",
    "body": [],
    "extra": [],
    "image": ""
  },
  "14": {
    "id": 14,
    "name": "our reviews",
    "title": "What Our Customers Say:",
    "body": [],
    "extra": [],
    "image": ""
  },
  "15": {
    "id": 15,
    "name": "How It Works",
    "title": "",
    "body": [],
    "extra": [],
    "image": ""
  },
  "16": {
    "id": 16,
    "name": "You Win It",
    "title": "",
    "body": [
      {
        "kind": "paragraph",
        "text": "Once you secure your auction purchase, contact Rapid Pack N Ship directly for an estimate."
      }
    ],
    "extra": [],
    "image": ""
  },
  "17": {
    "id": 17,
    "name": "We Pack It",
    "title": "",
    "body": [
      {
        "kind": "paragraph",
        "text": "Our team arrives to collect your item, evaluates its needs, and packages it using professional-grade materials designed for product safety."
      }
    ],
    "extra": [],
    "image": ""
  },
  "18": {
    "id": 18,
    "name": "We Ship It",
    "title": "",
    "body": [
      {
        "kind": "paragraph",
        "text": "We select the most cost effective shipping option, handle logistics, provide real time tracking, and deliver your item on time."
      }
    ],
    "extra": [],
    "image": ""
  },
  "19": {
    "id": 19,
    "name": "Leave your Message",
    "title": "Let Us Deliver Your Auction Wins With Care",
    "body": [
      {
        "kind": "paragraph",
        "text": "The auction process should end with excitement, not stress. Partner with Rapid Pack N Ship to enjoy fast, affordable, and worry free shipping designed exclusively for buyers like you."
      }
    ],
    "extra": [
      {
        "kind": "paragraph",
        "text": "Business Hours"
      },
      {
        "kind": "paragraph",
        "text": "Monday to Friday, 9:00 AM to 5:00 PM Central Time"
      }
    ],
    "image": ""
  },
  "20": {
    "id": 20,
    "name": "Terms of Use",
    "title": "",
    "body": [],
    "extra": [],
    "image": ""
  },
  "21": {
    "id": 21,
    "name": "Privacy Policy",
    "title": "",
    "body": [],
    "extra": [],
    "image": ""
  },
  "22": {
    "id": 22,
    "name": "Complete Auction Shipping and Packaging Solutions",
    "title": "",
    "body": [],
    "extra": [],
    "image": ""
  },
  "23": {
    "id": 23,
    "name": "What Sets Us Apart",
    "title": "",
    "body": [],
    "extra": [],
    "image": ""
  }
}

export const packaging: PackagingCategory[] = [
  {
    "id": 1,
    "title": "Custom Packaging",
    "body": [
      {
        "kind": "paragraph",
        "text": "We specialize in packaging solutions tailored to unique auction items."
      }
    ],
    "extra": []
  },
  {
    "id": 2,
    "title": "Discounted Parcel Shipping",
    "body": [
      {
        "kind": "item",
        "text": "Save up to 60 percent off retail carrier rates"
      },
      {
        "kind": "item",
        "text": "Options for economy, standard, express, and overnight"
      }
    ],
    "extra": [
      {
        "kind": "item",
        "text": "Carriers include UPS, FedEx, DHL, and USPS"
      },
      {
        "kind": "item",
        "text": "Full tracking from pickup to delivery"
      }
    ]
  },
  {
    "id": 3,
    "title": "Freight Shipping (LTL and FTL)",
    "body": [
      {
        "kind": "item",
        "text": "Less Than Truckload (LTL): cost effective for smaller loads or pallets"
      },
      {
        "kind": "item",
        "text": "Box Truckload with liftgate delivery"
      }
    ],
    "extra": [
      {
        "kind": "item",
        "text": "Full Truckload (FTL): dedicated transport for bulk shipments"
      },
      {
        "kind": "item",
        "text": "Nationwide freight network with competitive rates"
      },
      {
        "kind": "item",
        "text": "Custom freight solutions for oversized or high value items"
      }
    ]
  },
  {
    "id": 4,
    "title": "Domestic Shipping",
    "body": [
      {
        "kind": "item",
        "text": "Full coverage across all 50 states"
      },
      {
        "kind": "item",
        "text": "Flexible options for ground, rail, and air"
      }
    ],
    "extra": [
      {
        "kind": "item",
        "text": "Transparent pricing with no hidden fees"
      }
    ]
  },
  {
    "id": 5,
    "title": "International Shipping",
    "body": [
      {
        "kind": "item",
        "text": "Expertise in export paperwork and customs clearance"
      },
      {
        "kind": "item",
        "text": "Affordable international air and ocean freight options"
      }
    ],
    "extra": [
      {
        "kind": "item",
        "text": "Insurance coverage for added security"
      },
      {
        "kind": "item",
        "text": "Partnerships with global freight forwarders"
      },
      {
        "kind": "item",
        "text": "Reliable last mile delivery anywhere in the world"
      }
    ]
  },
  {
    "id": 6,
    "title": "Insurance and Tracking",
    "body": [
      {
        "kind": "item",
        "text": "Full value insurance to protect against damage or loss"
      },
      {
        "kind": "item",
        "text": "Real time tracking with 24/7 online updates"
      },
      {
        "kind": "item",
        "text": "Proactive alerts and notifications at each stage"
      }
    ],
    "extra": []
  }
]

export const testimonials: Testimonial[] = [
  {
    "id": 4,
    "name": "David M.",
    "rating": 4,
    "body": [
      {
        "kind": "paragraph",
        "text": "Rapid Pack N Ship is the only shipping company I trust with my auction wins. Their packaging is flawless, their rates are fair, and my items always arrive on time."
      }
    ]
  },
  {
    "id": 3,
    "name": "Isabelle R.",
    "rating": 5,
    "body": [
      {
        "kind": "paragraph",
        "text": "As an international buyer, customs used to stress me out. Now, with Rapid Pack N Ship, the process is seamless. My items are always delivered quickly and safely."
      }
    ]
  },
  {
    "id": 2,
    "name": "John W.",
    "rating": 4,
    "body": [
      {
        "kind": "paragraph",
        "text": "They handled my antique furniture with absolute care, building custom crates to protect each piece. Everything arrived overseas in perfect condition."
      }
    ]
  },
  {
    "id": 1,
    "name": "Laura M.",
    "rating": 5,
    "body": [
      {
        "kind": "paragraph",
        "text": "Fast, reliable, and affordable. Rapid Pack N Ship always delivers on time and keeps communication clear. Highly recommended for auction shipping needs."
      }
    ]
  }
]

export const benefits: Benefit[] = [
  {
    "id": 1,
    "title": "Tailored for Auction Buyers",
    "body": [
      {
        "kind": "paragraph",
        "text": "We built our business around the auction industry. Unlike general couriers who treat shipments the same, we understand the time-sensitive, high-value, and fragile nature of auction wins. Whether it is a fine art piece, a surgical microscope, or industrial equipment, we create custom packaging and shipping solutions that protect your investments."
      }
    ],
    "image": "/uploads/what_new/auction176367847949.png"
  },
  {
    "id": 2,
    "title": "Speed That Matches Auction Urgency",
    "body": [
      {
        "kind": "paragraph",
        "text": "When you win an auction, the clock starts ticking. Buyers want their items delivered quickly so they can either enjoy them, resell them, or put them to use. Sellers want the items removed rapidly and give a limited number of days to do so. At Rapid Pack N Ship, our operations are designed for fast pickup, immediate packaging, and expedited shipping. Many of our shipments are dispatched the same day or within 24 hours."
      }
    ],
    "image": "/uploads/what_new/timer176367855029.png"
  },
  {
    "id": 3,
    "title": "Professional Packaging Standards",
    "body": [
      {
        "kind": "paragraph",
        "text": "Your item’s safety starts with proper packaging. We use industry-grade packing materials such as, custom wooden crates, shock-absorbent foam inserts, weatherproof wrapping, and reinforced cartons. Our specialists evaluate each item’s size, weight, shape, and fragility before selecting the most suitable method. This minimizes risk and ensures safe delivery."
      }
    ],
    "image": "/uploads/what_new/shipping-cost176367859310.png"
  },
  {
    "id": 4,
    "title": "Affordable Shipping Rates with Big Savings",
    "body": [
      {
        "kind": "paragraph",
        "text": "We understand that shipping costs can deter buyers. That is why we partner with UPS, FedEx, DHL, USPS, and hundreds of licensed carriers worldwide to negotiate bulk discounts, saving our customers up to 60 percent compared to standard rates. These savings are passed directly to you."
      }
    ],
    "image": "/uploads/what_new/baner-point-3176367862097.png"
  },
  {
    "id": 5,
    "title": "Nationwide and Global Network",
    "body": [
      {
        "kind": "paragraph",
        "text": "We ship across the United States and worldwide. International buyers trust us because we can handle all aspects of export paperwork, customs clearance, insurance coverage, and final-mile delivery. No matter where you are, your auction wins will reach you without hassle."
      }
    ],
    "image": "/uploads/what_new/baner-point-3176374791521.png"
  },
  {
    "id": 6,
    "title": "Peace of Mind at Every Step",
    "body": [
      {
        "kind": "paragraph",
        "text": "Transparency is at the core of our service. With real time tracking and full value insurance, you are protected financially and informed logistically. You will know where your shipment is and when to expect it."
      }
    ],
    "image": "/uploads/what_new/baner-point-4176374805832.png"
  }
]

export const banner: {title: string; eyebrow: string; description: string} = {
  "title": "Fast, Reliable Auction Packaging and Shipping Services Because Time Is Money",
  "eyebrow": "From bid to doorstep, quick and easy",
  "description": "Rapid Pack N Ship is more than a shipping service. We are your logistics partner dedicated to auction buyers, ensuring that every purchase, no matter how big or small, is handled with care, packaged professionally, and shipped affordably. With decades of expertise in packaging, freight, and now, international delivery, we make auction shipping simple, reliable, and stress free."
}

export const innerBanners: Record<string, string> = {
  "About Us": "/uploads/inner_banner/banner-inner176367113156.png",
  "Services": "/uploads/inner_banner/banner-inner176367117034.png",
  "Service Detail": "/uploads/inner_banner/banner-inner176367117034.png",
  "Reviews": "/uploads/inner_banner/banner-inner176367118775.png",
  "How It Works": "/uploads/inner_banner/banner-inner176367120358.png",
  "Contact Us": "/uploads/inner_banner/banner-inner176367122339.png",
  "Terms of Use": "/uploads/inner_banner/banner-inner176367128444.png",
  "Privacy Policy": "/uploads/inner_banner/banner-inner176367130178.png"
}
