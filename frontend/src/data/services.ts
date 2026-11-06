import type { ContentBlock } from './content.ts'
export interface Service { id: number; slug: string; name: string; image: string; imageAlt: string; summary: string; description: ContentBlock[] }
export const services: Service[] = [
  {
    "id": 1,
    "slug": "parcel-shipping",
    "name": "Parcel Shipping",
    "summary": "Secure, reliable, and affordable small package shipping.",
    "description": [
      {
        "kind": "paragraph",
        "text": "At Rapid Pack N Ship, we make parcel shipping simple, fast, and affordable. Whether you’re moving small auction wins or important packages, our team ensures every item is packed securely and shipped with care. We understand that time is money, which is why we focus on quick turnaround times and reliable delivery you can trust."
      },
      {
        "kind": "paragraph",
        "text": "Our parcel shipping service is designed for flexibility and convenience, offering competitive rates without compromising on quality. From safe packaging to timely updates, we handle every step so you don’t have to worry. With Rapid Pack N Ship, you can count on stress-free parcel deliveries that save you time, reduce costs, and help you enjoy quicker profits from your auction sales."
      }
    ],
    "image": "/uploads/services/service-1176368173724.png",
    "imageAlt": "A parcel being labeled for shipping"
  },
  {
    "id": 2,
    "slug": "ltl-less-than-truckload-shipping",
    "name": "LTL (Less Than Truckload) Shipping",
    "summary": "Cost-effective shipping for medium loads that don’t require a full truck.",
    "description": [
      {
        "kind": "paragraph",
        "text": "Our LTL shipping service is the perfect solution for shipments that don’t require a full truck. At Rapid Pack N Ship, we make sure you only pay for the space you use, saving you money without sacrificing reliability. This service is ideal for auction items, small business shipments, or medium-sized loads needing secure and efficient transport."
      },
      {
        "kind": "paragraph",
        "text": "We partner with trusted carriers to provide flexible scheduling, fast transit times, and safe delivery of your freight. Every shipment is handled with care and precision, ensuring your items arrive on time and in great condition. With competitive rates and a focus on customer service, Rapid Pack N Ship makes LTL shipping an economical and stress-free option for your transportation needs."
      }
    ],
    "image": "/uploads/services/service-2176368189521.png",
    "imageAlt": "Freight being prepared beside a delivery truck"
  },
  {
    "id": 3,
    "slug": "full-truckload-shipping",
    "name": "Full Truckload Shipping",
    "summary": "Dedicated truckload services for large shipments needing full capacity.",
    "description": [
      {
        "kind": "paragraph",
        "text": "When you need to move large shipments, our Full Truckload (FTL) shipping service offers speed, security, and cost-efficiency. At Rapid Pack N Ship, we provide dedicated truckload services that give your freight the exclusive space it needs, perfect for high-volume auction wins, business deliveries, or oversized items."
      },
      {
        "kind": "paragraph",
        "text": "With FTL shipping, your goods travel directly from pickup to destination without unnecessary stops, reducing handling and minimizing the risk of damage. We partner with reliable carriers and use efficient routing to ensure on-time delivery across local, regional, and national routes. Combining competitive rates with exceptional customer service, Rapid Pack N Ship makes full truckload shipping a seamless solution for clients needing dependable, large-scale transport they can trust."
      }
    ],
    "image": "/uploads/services/serv-3176368194285.jpeg",
    "imageAlt": "Palletized freight being loaded into a truck"
  },
  {
    "id": 4,
    "slug": "intermodal-global-shipping",
    "name": "Intermodal Global Shipping",
    "summary": "Flexible international shipping combining land, sea, and air for efficient worldwide delivery.",
    "description": [
      {
        "kind": "paragraph",
        "text": "At Rapid Pack N Ship, our Intermodal Global Shipping service connects you to the world with reliable, cost-effective transport solutions. By combining multiple modes of transportation, truck, rail, sea, and air, we create flexible routes that move your auction items or business freight quickly and efficiently across borders."
      },
      {
        "kind": "paragraph",
        "text": "This service is designed for clients who need international reach without the stress of coordinating complex logistics. We handle every step, from secure packaging to carrier selection and customs clearance, ensuring a smooth and timely delivery. With competitive rates, global partnerships, and a customer-first approach, Rapid Pack N Ship makes worldwide shipping simple, affordable, and dependable, helping you expand your reach while saving both time and money."
      }
    ],
    "image": "/uploads/services/serv-4176368201187.webp",
    "imageAlt": "International freight shipping"
  }
]
