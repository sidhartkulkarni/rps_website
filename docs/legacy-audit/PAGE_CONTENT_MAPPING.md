# Page content mapping

Audit date: 2026-11-06. Offline/read-only source inspection; no application/PHP/SQL execution, database connection, deployment, archive extraction, or changes to React. Source root: `/Users/siddharthkulkarni/Downloads/RPS FE WS`. Paths below are relative to `TransferNow-20261030We5tBjjq/api (1)` unless stated otherwise. Snapshot status is not proof of current production deployment.

## Recoverability and counting

Nine public page families are evidenced by primary navigation/footer/controller/CMS mappings: Home, About, Services, Service Detail, Reviews, How It Works, Contact, Terms, Privacy. Four active service slugs yield **12 concrete public content URLs** (eight non-detail URLs plus four detail URLs). Account/checkout are supporting workflows, not included in that marketing-page count. Route declarations include substantial unrelated inherited code; controller presence is not proof of traffic or deployability.

| Page | Canonical route | Source view under application/views | CMS IDs/data | React page | Remaining |
| --- | --- | --- | --- | --- | --- |
| Home | / | home/index.php | 1–6, 23 | Home.tsx | Home benefits, original services, CMS story/why-us, contact copy, footer and exact media mapping |
| About Us | /about-us | About_us/index.php | 8–12 | About.tsx | Replace restoration notices; correct introduction/story and CMS image assignments |
| Services | /services | Services/index.php | 22 + rp_services + rp_shipping_packaging | Services.tsx | Four real services, six packaging categories and native expand/collapse |
| Service details | /service-detail/:slug | Services/detail.php | rp_services.services_field_1 | ServiceDetail.tsx | Populate four verified slug records; render sanitized descriptions |
| Reviews | /reviews | Reviews/index.php | 14 + rp_testimonial | Reviews.tsx | Four active review records with ratings; no review submission |
| How It Works | /how-it-works | About_us/how_it_works.php | 1,2,15–18 | HowItWorks.tsx | Restore step descriptions; verify captions, media playback and responsive layout |
| Contact Us | /contact-us | Contact_us/index.php | 19 + rp_config | Contact.tsx | Verified business phone/email/map and form API |
| Terms of Use | /terms-and-conditions | About_us/page.php | 20 | missing | Legal page + footer link, owner legal review |
| Privacy Policy | /privacy-policy | About_us/policy.php | 21 | missing | Legal page + footer link, owner legal review |

## Configured route inventory

148 distinct quoted route mappings found after comment removal, including admin dispatch; duplicates collapse to the last assignment. `default_controller=home/index` and `translate_uri_dashes=true` are separate settings. Supporting-route count beyond the nine canonical content patterns: **140** (Home is the default, not an explicit quoted route). This count includes aliases, inherited routes and missing targets; it is not an active-endpoint count. Public controller methods can also be reachable by CodeIgniter convention beyond these aliases.

| Route pattern | Target | Evidence classification |
| --- | --- | --- |
| admin | admin | target absent or administrative dispatch; do not assume active |
| admin/(:any) | admin/$1 | target absent or administrative dispatch; do not assume active |
| dologin | home/login | target absent or administrative dispatch; do not assume active |
| post-job | About_us/index/ | controller/method present; activity unverified |
| post-jobs | About_us/index/ | controller/method present; activity unverified |
| about-us | About_us/index/ | controller/method present; activity unverified |
| about | About_us/index/ | controller/method present; activity unverified |
| how-it-works | About_us/how_it_works | controller/method present; activity unverified |
| how-it-work | About_us/how_it_works | controller/method present; activity unverified |
| safety | About_us/safety | controller/method present; activity unverified |
| summer-intensives | About_us/summer_intensives/ | controller/method present; activity unverified |
| resume | Resume/index/ | target absent or administrative dispatch; do not assume active |
| my-work | My_work/index/ | target absent or administrative dispatch; do not assume active |
| my-work-detail/(:any) | My_work/detail/$1 | target absent or administrative dispatch; do not assume active |
| tracks | Tracks/index/ | target absent or administrative dispatch; do not assume active |
| portfolio | Portfolio/index/ | target absent or administrative dispatch; do not assume active |
| appointment | Appointment/index/ | target absent or administrative dispatch; do not assume active |
| blogs | Blog/index/ | controller/method present; activity unverified |
| blog | Blog/index/ | controller/method present; activity unverified |
| news | News/index/ | controller/method present; activity unverified |
| new | New/index/ | target absent or administrative dispatch; do not assume active |
| news-detail/(:any) | News/detail/$1 | controller/method present; activity unverified |
| albums | Album/index/ | controller/method present; activity unverified |
| album | Album/index/ | controller/method present; activity unverified |
| album/(:any) | Album/detail/$1 | controller/method present; activity unverified |
| searchlist | About_us/searchlist/ | controller/method present; activity unverified |
| blog-detail/(:any) | Blog/detail/$1 | controller/method present; activity unverified |
| articles-leading-libyan-law-firm | Articles/index/ | target absent or administrative dispatch; do not assume active |
| article-detail/(:any) | Articles/detail/$1 | target absent or administrative dispatch; do not assume active |
| services | Services/index/ | controller/method present; activity unverified |
| service-detail/(:any) | Services/detail/$1 | controller/method present; activity unverified |
| programs | Programs/index/ | target absent or administrative dispatch; do not assume active |
| program-detail/(:any) | Programs/detail/$1 | target absent or administrative dispatch; do not assume active |
| what-we-believe | What_we_believe/index/ | target absent or administrative dispatch; do not assume active |
| article/(:any) | Services/index/ | controller/method present; activity unverified |
| reviews | Reviews/index/ | controller/method present; activity unverified |
| testimonial | Testimonial/index/ | target absent or administrative dispatch; do not assume active |
| testimonials | Testimonial/index/ | target absent or administrative dispatch; do not assume active |
| success-stories | Success_stories/index/ | target absent or administrative dispatch; do not assume active |
| success-stories-detail/(:any) | Success_stories/detail/$1 | target absent or administrative dispatch; do not assume active |
| cabins | Cabin/index/ | target absent or administrative dispatch; do not assume active |
| cabin | Cabin/index/ | target absent or administrative dispatch; do not assume active |
| cabins-detail/(:any) | Cabin/detail/$1 | target absent or administrative dispatch; do not assume active |
| cabin-detail/(:any) | Cabin/detail/$1 | target absent or administrative dispatch; do not assume active |
| boats | Boats/index/ | target absent or administrative dispatch; do not assume active |
| boats-detail/(:any) | Boats/detail/$1 | target absent or administrative dispatch; do not assume active |
| event | Event/index/ | target absent or administrative dispatch; do not assume active |
| events | Event/index/ | target absent or administrative dispatch; do not assume active |
| event-detail/(:any) | Event/detail/$1 | target absent or administrative dispatch; do not assume active |
| donation | Donation/index/ | target absent or administrative dispatch; do not assume active |
| jobs | Job_portal/index/ | target absent or administrative dispatch; do not assume active |
| job | Job_portal/index/ | target absent or administrative dispatch; do not assume active |
| job-location/(:any) | Job_portal/index/$1 | target absent or administrative dispatch; do not assume active |
| job-detail/(:any) | Job_portal/detail/$1 | target absent or administrative dispatch; do not assume active |
| apply-now/(:any) | Job_portal/apply_form/$1 | target absent or administrative dispatch; do not assume active |
| delivery | About_us/delivery/ | controller/method present; activity unverified |
| about-me | About_us/about_me/ | controller/method present; activity unverified |
| terms-and-conditions | About_us/termsconditions/ | controller/method present; activity unverified |
| terms-conditions | About_us/termsconditions/ | controller/method present; activity unverified |
| privacy-policy | About_us/policy/ | controller/method present; activity unverified |
| cookie-policy | About_us/cookie_policy/ | controller/method present; activity unverified |
| return-policy | About_us/return_policy/ | controller/method present; activity unverified |
| holistic-sleep-coach-charter | About_us/holistic_policy/ | controller/method present; activity unverified |
| disclaimer | About_us/disclaimer/ | controller/method present; activity unverified |
| shipping-policy | About_us/shipping_policy/ | controller/method present; activity unverified |
| contact-us | Contact_us/index/ | controller/method present; activity unverified |
| contact | Contact_us/index/ | controller/method present; activity unverified |
| customize | Customize/index/ | target absent or administrative dispatch; do not assume active |
| Customizer/success-thankyou | Customizer/success/ | controller/method present; activity unverified |
| faqs | Faqs/index/ | controller/method present; activity unverified |
| gallery | Gallery/index/ | target absent or administrative dispatch; do not assume active |
| videos | Videos/index/ | target absent or administrative dispatch; do not assume active |
| product | Products/index/ | controller/method present; activity unverified |
| product-detail/(:any) | Products/detail/$1 | controller/method present; activity unverified |
| category/(:any) | Products/index/$1 | controller/method present; activity unverified |
| stickers | Stickers/index/ | target absent or administrative dispatch; do not assume active |
| stickers/(:any) | Stickers/index/$1 | target absent or administrative dispatch; do not assume active |
| tony-favorites | Products/tony_favorites/ | target absent or administrative dispatch; do not assume active |
| tony_favorites | Products/tony_favorites/ | target absent or administrative dispatch; do not assume active |
| pricing | Products/pricing/ | controller/method present; activity unverified |
| purchase/page/(:any) | Products/index/$1 | controller/method present; activity unverified |
| purchase/page | Products/index/$1 | controller/method present; activity unverified |
| calender_detail/(:any) | Products/calender_detail/$1 | controller/method present; activity unverified |
| best_seller | Products/best_seller | controller/method present; activity unverified |
| purchase | Products/index | controller/method present; activity unverified |
| new_arivals | Products/new_arivals | controller/method present; activity unverified |
| my-cart | Checkout/index/ | controller/method present; activity unverified |
| checkout | Checkout/index/ | controller/method present; activity unverified |
| checkout/step2 | Checkout/step2/ | controller/method present; activity unverified |
| checkout/step3 | Checkout/step3/ | controller/method present; activity unverified |
| checkout/step4 | Checkout/step4/ | controller/method present; activity unverified |
| checkout/bank-transfer | Checkout/bank_transfer/ | controller/method present; activity unverified |
| checkout/success | Checkout/success/ | controller/method present; activity unverified |
| checkout/success-thankyou | Checkout/success_stripe/ | controller/method present; activity unverified |
| checkout/worldpay_charge_payment | Checkout/worldpay_charge_payment/ | controller/method present; activity unverified |
| comment_save | Products/comment_save | controller/method present; activity unverified |
| comment-save | Products/comment_save | controller/method present; activity unverified |
| all-comments | Products/all_comments | target absent or administrative dispatch; do not assume active |
| customize-order | Products/customize_order | controller/method present; activity unverified |
| customize-order/step3 | Products/payment_step | controller/method present; activity unverified |
| p | Payment/index | target absent or administrative dispatch; do not assume active |
| payment/confirm | Payment/confirm | target absent or administrative dispatch; do not assume active |
| login | Account/login | controller/method present; activity unverified |
| login-signup | Account/login | controller/method present; activity unverified |
| register | Account/register | controller/method present; activity unverified |
| zip-lookup | Account/zip_lookup | controller/method present; activity unverified |
| my-account/zip-lookup | Account/zip_lookup | controller/method present; activity unverified |
| logout | Account/logout | controller/method present; activity unverified |
| forgot-password | Account/forgot_password | controller/method present; activity unverified |
| my-account | Account/index | controller/method present; activity unverified |
| verication-process | Account/verication_process | controller/method present; activity unverified |
| my-account/change-image | Account/change_image | controller/method present; activity unverified |
| my-account/my-games | Account/my_products | controller/method present; activity unverified |
| my-account/add-product | Account/add_products | controller/method present; activity unverified |
| my-account/product-management | Account/add_products | controller/method present; activity unverified |
| my-account/product-management/add/(:any) | Account/edit_product/$1 | controller/method present; activity unverified |
| my-account/product-listings | Account/all_products | controller/method present; activity unverified |
| my-account/all-products | Account/all_products | controller/method present; activity unverified |
| my-account/chat | Account/start_chat | controller/method present; activity unverified |
| my-account/chat/(:any) | Account/start_chat/$1 | controller/method present; activity unverified |
| my-account/help | Account/help | controller/method present; activity unverified |
| my-account/report | Account/report | controller/method present; activity unverified |
| my-account/inbox | Account/inbox | controller/method present; activity unverified |
| my-account/invoice/(:any) | Account/get_invoice/$1 | controller/method present; activity unverified |
| my-account/customize-history | Account/customizehistory | controller/method present; activity unverified |
| my-account/get_customize_invoice/(:any) | Account/get_customize_invoice/$1 | controller/method present; activity unverified |
| my-account/info | Account/info | controller/method present; activity unverified |
| my-account/quotes | Account/quotes | controller/method present; activity unverified |
| my-account/quote-listings | Account/quotelistings | controller/method present; activity unverified |
| my-account/quote-invoice/(:any) | Account/quote_invoice/$1 | controller/method present; activity unverified |
| my-account/profiles | Account/profiles | controller/method present; activity unverified |
| my-account/profiles/(:any) | Account/profiles/$1 | controller/method present; activity unverified |
| my-account/matches | Account/matches | controller/method present; activity unverified |
| my-account/setting | Account/setting | controller/method present; activity unverified |
| my-account/job-listings | Account/job_listings | target absent or administrative dispatch; do not assume active |
| my-account/job-management | Account/job_management | target absent or administrative dispatch; do not assume active |
| my-account/job-management/(:any) | Account/job_management/$1 | target absent or administrative dispatch; do not assume active |
| my-account/my-profile/(:any) | Account/my_profile/$1 | controller/method present; activity unverified |
| my-account/change-password | Account/change_password | controller/method present; activity unverified |
| my-account/order-history | Account/orderhistory | controller/method present; activity unverified |
| my-account/subscription-history | Account/subscriptionhistory | controller/method present; activity unverified |
| my-account/subscription-invoice/(:any) | Account/subscription_invocie/$1 | controller/method present; activity unverified |
| my-account/order-affiliate | Account/orderaffiliate | controller/method present; activity unverified |
| my-account/my-wishlist | Account/mywishlist | controller/method present; activity unverified |
| account/resetpassword | Account/resetpassword | controller/method present; activity unverified |
| account/delete_product/(:any) | Account/delete_product/$1 | controller/method present; activity unverified |
| my-account/edit-product/(:any) | Account/edit_product/$1 | controller/method present; activity unverified |
| my-account/paynow-profile | Account/paynow_profile | target absent or administrative dispatch; do not assume active |

## Shared hardcoded content, actions and SEO

Navigation: Home, About Us, Services, Reviews, How It Work, Contact Us; header also links Sign In to `/my-account`. Footer contains service links, newsletter, social links and Terms/Privacy. Hero quote action and account/quotation behavior need reconnecting, not a fabricated success UI. Contact form: Name required, Email, Subject required, Message; POST-style AJAX to `Contact_us/store`, reCAPTCHA. Contact sidebar hardcodes `rapidpacknship.com`. Reviews submission is commented out; its leftover script is not functional production behavior to copy.

`widgets/inner_banner.php` uses `inner_banner_other_image`, not merely `inner_banner_image`; service detail uses the Services banner and hardcoded “Service Detail” title. Controllers choose CMS and banner IDs. Layout title is page title plus configured company name; meta description uses title/company, canonical uses CURRENT_URL. CMS meta title/keywords/description columns exist but recovered public CMS meta fields are empty. Do not claim recovered optimized SEO. Build stable canonical URLs, unique descriptions, sitemap/robots and social metadata, preserving aliases/redirects; decide prerendering/SSR for crawlability separately.

## Verified public business settings

- `phone_contact`: 469-732-4444
- `email_contact`: sales@rapidpacknship.com
- `location_address`: Lorem ipsum dolor sit ame ipsum
- `copyrights`: Copyrigt © 2025 Rapid Pack N Ship \|
- `company_name`: Rapid Pack

The phone and sales email are rendered by public templates. The address is lorem ipsum and must not be published as a real address. Company short-name/copyright spelling require owner approval. Config social/map values require destination review; no arbitrary config export is appropriate.

## Recovered public CMS content

Plain-text transcription of status=1 records 1–23; source HTML is not executed. Preserve lists/formatting from sanitized HTML during implementation. Record 24 is account-specific and excluded. Publication was enabled in this snapshot; legal/business accuracy still requires owner review.

### CMS 1: English Video (How it works Video)


### CMS 2: Spanish Video (How it works Video)


### CMS 3: OUR STORY (Home Page)

**cms_page_title_2**

About Rapid Pack N Ship

**cms_page_content**

Rapid Pack N Ship was founded to address a clear and pressing problem. Traditional shipping companies often fail to understand the needs of auction buyers. Auctions move fast, involve unpredictable items, and demand careful handling.


### CMS 4: Our Services (Home Page)

**cms_page_title_2**

Reliable Shipping Solutions


### CMS 5: WHY CHOOSE US (Home Page)

**cms_page_title_2**

The Smarter Shipping Choice

**cms_page_content**

At Rapid Pack N Ship, we combine speed, affordability, and exceptional service, delivering auction items quickly and reliably, so you save time, maximize profits, and enjoy stress-free  shipping.


### CMS 6: Get In Touch (Home Page)

**cms_page_title_2**

Reach us today for fast support

**cms_page_content**

Central Cargo 

 Dubai, Uni Emrates Arab


### CMS 7: Footer Content (Footer)

**cms_page_content**

*In areas currently served by RPS you Must contract with RPS within five working days from the last pick up date*


### CMS 8: OUR STORY (About Us Page)

**cms_page_content**

About Rapid Pack N Ship 

 Rapid Pack N Ship was founded to address a clear and pressing problem. Traditional shipping companies often fail to understand the needs of auction buyers. Auctions move fast, involve unpredictable items, and demand careful handling. Yet many buyers face: 

 
  Late fees or abandonment of items if they are not picked up in time 
  Items arriving damaged due to careless packaging 
  Inflated shipping quotes from carriers unfamiliar with auctions 
  Weeks of waiting before items are delivered 
  Little or no communication during the process 
 

 We knew there had to be a better way. 

 Our founders, combining their backgrounds in logistics, transportation, and packaging design, built a service dedicated exclusively to auction buyers. Today, we serve customers across the United States and internationally, providing fast, affordable, and reliable auction shipping.


### CMS 9: Our Vision (About Us Page)

**cms_page_title_2**

Shaping the Future of Shipping

**cms_page_content**

To become the global standard for auction shipping services, trusted by buyers, auction houses, and businesses for our professionalism, expertise, and customer-first approach.


### CMS 10: Our Mission (About Us Page)

**cms_page_content**

Committed to Smarter Shipping  

 To empower auction buyers by providing secure packaging, transparent pricing, and efficient shipping services that ensure every win arrives on time and in perfect condition.


### CMS 11: Our Core Values (About Us Page)

**cms_page_content**

Integrity: We keep our promises and deliver on commitments 
   Speed: We move as quickly as the auctions themselves 
   Care: Every item is packaged as if it were our own items 
   Affordability: We provide world class service at competitive rates 
   Communication: We ensure clients are updated every step of the way


### CMS 12: Why Clients Trust Us (About Us Page)

**cms_page_content**

Decades of combined experience in logistics 
  Thousands of successfully shipped auction items annually 
  Proven track record of safe and on time deliveries 
  Partnerships with top carriers worldwide


### CMS 13: our services (Service page)

**cms_page_title_2**

Reliable Shipping Solutions


### CMS 14: our reviews (Reviews Page)

**cms_page_title_2**

What Our Customers Say:

**cms_page_content**

I want real reviews and can supply leads once the website is operational.


### CMS 15: How It Works (How it Works Page)


### CMS 16: You Win It (How it Works Page)

**cms_page_content**

Once you secure your auction purchase, contact Rapid Pack N Ship directly for an estimate.


### CMS 17: We Pack It (How it Works Page)

**cms_page_content**

Our team arrives to collect your item, evaluates its needs, and packages it using professional-grade materials designed for product safety.


### CMS 18: We Ship It (How it Works Page)

**cms_page_content**

We select the most cost effective shipping option, handle logistics, provide real time tracking, and deliver your item on time.


### CMS 19: Leave your Message (Contact Us Page)

**cms_page_title_2**

Let Us Deliver Your Auction Wins With Care

**cms_page_content**

The auction process should end with excitement, not stress. Partner with Rapid Pack N Ship to enjoy fast, affordable, and worry free shipping designed exclusively for buyers like you.

**cms_page_other_content**

&lt;h5&gt;Business Hours&lt;/h5&gt;

&lt;p&gt;Monday to Friday, 9:00 AM to 5:00 PM Central Time&lt;/p&gt;


### CMS 20: Terms of Use (Terms of Use Page)

**cms_page_content**

Lorem Ipsum  is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.


### CMS 21: Privacy Policy (Privacy Policy Page)

**cms_page_content**

Lorem Ipsum  is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.


### CMS 22: Complete Auction Shipping and Packaging Solutions (Service page)


### CMS 23: What Sets Us Apart (Home Page)


## Public banner and benefits copy

### rp_banner #1

**banner_title**: Fast, Reliable Auction Packaging and Shipping Services Because Time Is Money

**banner_field_1**: From bid to doorstep, quick and easy

**banner_detail**: Rapid Pack N Ship is more than a shipping service. We are your logistics partner dedicated to auction buyers, ensuring that every purchase, no matter how big or small, is handled with care, packaged professionally, and shipped affordably. With decades of expertise in packaging, freight, and now, international delivery, we make auction shipping simple, reliable, and stress free.

### rp_what_new #1

**what_new_title**: Tailored for Auction Buyers

**what_new_detail**: We built our business around the auction industry. Unlike general couriers who treat shipments the same, we understand the time-sensitive, high-value, and fragile nature of  auction wins. Whether it is a fine art piece, a surgical microscope, or industrial equipment, we create custom packaging and shipping solutions that protect your investments.

### rp_what_new #2

**what_new_title**: Speed That Matches Auction Urgency

**what_new_detail**: When you win an auction, the clock starts ticking. Buyers want their items delivered quickly so they can either enjoy them, resell them, or put them to use. Sellers want the items removed rapidly and give a limited number of days to do so. At Rapid Pack N Ship, our operations are designed for fast pickup, immediate packaging, and expedited shipping. Many of our shipments are dispatched the same day or within 24 hours.

### rp_what_new #3

**what_new_title**: Professional Packaging Standards

**what_new_detail**: Your item’s safety starts with proper packaging. We use industry-grade packing materials such as, custom wooden crates, shock-absorbent foam inserts, weatherproof wrapping, and reinforced cartons. Our specialists evaluate each item’s size, weight, shape, and fragility before selecting the most suitable method. This minimizes risk and ensures safe delivery.

### rp_what_new #4

**what_new_title**: Affordable Shipping Rates with Big Savings

**what_new_detail**: We understand that shipping costs can deter buyers. That is why we partner with UPS, FedEx, DHL, USPS, and hundreds of licensed carriers worldwide to negotiate bulk discounts, saving our customers up to 60 percent compared to standard rates. These savings are passed directly to you.

### rp_what_new #5

**what_new_title**: Nationwide and Global Network

**what_new_detail**: We ship across the United States and worldwide. International buyers trust us because we can handle all aspects of export paperwork, customs clearance, insurance coverage, and final-mile delivery. No matter where you are, your auction wins will reach you without hassle.

### rp_what_new #6

**what_new_title**: Peace of Mind at Every Step

**what_new_detail**: Transparency is at the core of our service. With real time tracking and full value insurance, you are protected financially and informed logistically. You will know where your shipment is and when to expect it.

### rp_work_process #1

**work_process_title**: You Win It

**work_process_detail**: Once you secure your auction purchase, contact Rapid Pack N Ship directly for an estimate.

### rp_work_process #2

**work_process_title**: We Pack It

**work_process_detail**: Our team arrives to collect your item, evaluates its needs, and packages it using professional-grade materials designed for product safety.

### rp_work_process #3

**work_process_title**: We Ship It

**work_process_detail**: We select the most cost effective shipping option, handle logistics, provide real time tracking, and deliver your item on time.

## Database media mapping

Paths are preserved. Source/React existence is an offline file check, not an image identity or video playback test. `assets/` maps to frontend/public root.

| Table | ID | Field | Original path | Source exists | React exists |
| --- | --- | --- | --- | --- | --- |
| rp_cms_page | 1 | cms_page_video_url | assets/uploads/cms/Rapid_and_ship_Video_Animation_Final_-_English.mp4 | True | True |
| rp_cms_page | 2 | cms_page_video_url | assets/uploads/cms/Rapid_and_ship_Video_Animation_Spanish_Final.mp4 | True | True |
| rp_cms_page | 3 | cms_page_image | assets/uploads/cms/about-main176367930880.png | True | True |
| rp_cms_page | 3 | cms_page_image_2 | assets/uploads/cms/about-back176375302471.png | True | True |
| rp_cms_page | 5 | cms_page_image | assets/uploads/cms/story-1176375063574.png | True | True |
| rp_cms_page | 5 | cms_page_image_2 | assets/uploads/cms/story-2176375063530.png | True | True |
| rp_cms_page | 6 | cms_page_image | assets/uploads/cms/place1763756731251176402057573.png | True | True |
| rp_cms_page | 8 | cms_page_image | assets/uploads/cms/about-main1176367962046.png | True | True |
| rp_cms_page | 9 | cms_page_image | assets/uploads/cms/vision176367964550.png | True | True |
| rp_cms_page | 10 | cms_page_image | assets/uploads/cms/mission176367969746.png | True | True |
| rp_cms_page | 11 | cms_page_image | assets/uploads/cms/corevalue176367972158.png | True | True |
| rp_cms_page | 12 | cms_page_image | assets/uploads/cms/client-trust176367974411.webp | True | True |
| rp_services | 1 | services_image | assets/uploads/services/service-1176368173724.png | True | True |
| rp_services | 2 | services_image | assets/uploads/services/service-2176368189521.png | True | True |
| rp_services | 3 | services_image | assets/uploads/services/serv-3176368194285.jpeg | True | True |
| rp_services | 4 | services_image | assets/uploads/services/serv-4176368201187.webp | True | True |
| rp_testimonial | 1 | testimonial_image | assets/uploads/testimonial/review-41176367786629.jpg | True | True |
| rp_testimonial | 2 | testimonial_image | assets/uploads/testimonial/review-3176367788493.jpg | True | True |
| rp_testimonial | 3 | testimonial_image | assets/uploads/testimonial/review-2176367790417.jpg | True | True |
| rp_testimonial | 4 | testimonial_image | assets/uploads/testimonial/review176367791970.png | True | True |
| rp_banner | 1 | banner_image | assets/uploads/banner/banner176365794843176401742164.jpg | True | True |
| rp_inner_banner | 1 | inner_banner_other_image | assets/uploads/inner_banner/banner-inner176367113156.png | True | True |
| rp_inner_banner | 2 | inner_banner_other_image | assets/uploads/inner_banner/banner-inner176367117034.png | True | True |
| rp_inner_banner | 3 | inner_banner_other_image | assets/uploads/inner_banner/banner-inner176367118775.png | True | True |
| rp_inner_banner | 4 | inner_banner_other_image | assets/uploads/inner_banner/banner-inner176367120358.png | True | True |
| rp_inner_banner | 5 | inner_banner_other_image | assets/uploads/inner_banner/banner-inner176367122339.png | True | True |
| rp_inner_banner | 6 | inner_banner_other_image | assets/uploads/inner_banner/banner-inner176367125949.png | True | True |
| rp_inner_banner | 7 | inner_banner_other_image | assets/uploads/inner_banner/banner-inner176367128444.png | True | True |
| rp_inner_banner | 8 | inner_banner_other_image | assets/uploads/inner_banner/banner-inner176367130178.png | True | True |
| rp_logo | 1 | logo_image | assets/uploads/logo/logo176341173016176401704817.png | True | True |
| rp_logo | 1 | logo_footer_image | assets/uploads/logo/footer176401707186.png | True | True |
| rp_logo | 1 | logo_favicon_image | assets/uploads/logo/favicon176401708549.png | True | True |
| rp_what_new | 1 | what_new_image | assets/uploads/what_new/auction176367847949.png | True | True |
| rp_what_new | 2 | what_new_image | assets/uploads/what_new/timer176367855029.png | True | True |
| rp_what_new | 3 | what_new_image | assets/uploads/what_new/shipping-cost176367859310.png | True | True |
| rp_what_new | 4 | what_new_image | assets/uploads/what_new/baner-point-3176367862097.png | True | True |
| rp_what_new | 5 | what_new_image | assets/uploads/what_new/baner-point-3176374791521.png | True | True |
| rp_what_new | 6 | what_new_image | assets/uploads/what_new/baner-point-4176374805832.png | True | True |
