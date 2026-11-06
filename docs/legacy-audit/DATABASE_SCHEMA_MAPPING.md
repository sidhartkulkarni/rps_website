# Database schema mapping

Audit date: 2026-11-06. Offline/read-only source inspection; no application/PHP/SQL execution, database connection, deployment, archive extraction, or changes to React. Source root: `/Users/siddharthkulkarni/Downloads/RPS FE WS`. Paths below are relative to `TransferNow-20261030We5tBjjq/api (1)` unless stated otherwise. Snapshot status is not proof of current production deployment.

## Method and limits

Both exports were parsed as text with a quote-aware INSERT reader for allowlisted public tables. Nothing was imported, evaluated, or executed. No production/RDS connection occurred. SQL can contain executable statements and untrusted HTML; it is not a trusted migration script. Private table rows were neither printed nor included in reports. Column names below describe schema only.

`rapidpacknship_live_db.sql` is the website schema/content snapshot (export header: Oct 29, 2026; MariaDB 10.11.19, export PHP 8.4.27). `rpns.sql` is a separate invoice/warehouse database. Dump filenames do not prove live database identity or runtime deployment.


## rapidpacknship_live_db.sql: 29 tables

| Table | Columns | Classification |
| --- | --- | --- |
| rp_assistant_admin | assistant_admin_id, assistant_admin_fname, assistant_admin_lname, assistant_admin_email, assistant_admin_address, assistant_admin_city, assistant_admin_zip, assistant_admin_phone, assistant_admin_whatsapp, assistant_admin_notes, assistant_admin_password, assistant_admin_created_by, assistant_admin_status, assistant_admin_createdon, assistant_admin_manager_id, assistant_admin_parent_id | Operational/private/reference; no row export |
| rp_banner | banner_id, banner_title, banner_field_1, banner_field_2, banner_field_3, banner_detail, banner_image_path, banner_image, banner_other_image, banner_page, banner_url, banner_position, banner_status, banner_createdon | Public-content candidate; filter status |
| rp_category | category_id, category_parent_id, category_position, category_name, category_banner_title, category_banner_detail, category_slug, category_desc_title, category_desc, category_extra1, category_extra2, category_extra3, category_image, category_irp_image, category_home_image, category_image_path, category_status, category_is_featured, category_is_new, category_is_menu, category_createdon | Operational/private/reference; no row export |
| rp_city | city_id, city_state_id, city_name, city_county, city_lat, city_lon, city_status, city_createdon | Operational/private/reference; no row export |
| rp_ci_sessions | id, ip_address, timestamp, data | Operational/private/reference; no row export |
| rp_cms_page | cms_page_id, cms_page_page, cms_page_name, cms_page_title_2, cms_page_title_3, cms_page_meta_title, cms_page_meta_keyword, cms_page_meta_description, cms_page_status, cms_page_content, cms_page_other_content, cms_page_other_content_2, cms_page_image_path, cms_page_image, cms_page_image_2, cms_page_image_3, cms_page_video_url, cms_page_size, cms_page_is_image, cms_page_is_video | Public-content candidate; filter status |
| rp_comment | comment_id, comment_post_id, comment_post_name, comment_yes, comment_name, comment_subject, comment_rating, comment_email, comment_description, comment_website, comment_status, comment_created_on | Operational/private/reference; no row export |
| rp_config | config_id, config_variable, config_value, config_type, is_readonly, is_url, is_email, is_number, is_tel, is_text, config_is_required, config_status | Public-content candidate; filter status |
| rp_country | country, id, sb_countrycode, sb_faxprice, sb_country_alias, sb_in_countrysearch, sb_synonyms, country_ar, country_cn, country_es, country_jp, country_fr, sb_continent, sb_iso_code, sb_country_name_native_lang | Operational/private/reference; no row export |
| rp_coupon | coupon_id, coupon_code, coupon_comments, coupon_audience, coupon_type, coupon_rate, coupon_status, coupon_createdate, coupon_expire_date, coupon_start_date | Operational/private/reference; no row export |
| rp_faq | faq_id, faq_question_type, faq_question, faq_answer, faq_status, faq_createdon, faq_is_menu, faq_is_service | Public-content candidate; filter status |
| rp_gallery | gallery_id, gallery_name, gallery_image, gallery_image_path, gallery_status, gallery_createdon | Operational/private/reference; no row export |
| rp_inner_banner | inner_banner_id, inner_banner_title, inner_banner_field_1, inner_banner_field_2, inner_banner_field_3, inner_banner_detail, inner_banner_image_path, inner_banner_image, inner_banner_other_image, inner_banner_page, inner_banner_url, inner_banner_position, inner_banner_status, inner_banner_createdon | Public-content candidate; filter status |
| rp_inquiry | inquiry_id, inquiry_name, inquiry_lname, inquiry_company, inquiry_position, inquiry_country, inquiry_email, inquiry_phone, inquiry_interest, inquiry_order_id, inquiry_address, inquiry_city, inquiry_state, inquiry_zip, inquiry_subject, inquiry_about, inquiry_bedroom, inquiry_bathroom, inquiry_comments, inquiry_community, inquiry_status, inquiry_createdon | Operational/private/reference; no row export |
| rp_logo | logo_id, logo_name, logo_image, logo_footer_image, logo_favicon_image, logo_image_thumb, logo_image_path, logo_status, ondate | Public-content candidate; filter status |
| rp_newsletter | newsletter_id, newsletter_zip, newsletter_email, newsletter_status, newsletter_createdon | Operational/private/reference; no row export |
| rp_quote | quote_id, quote_user_id, quote_to_country, quote_to_address, quote_to_port, quote_to_city, quote_to_state, quote_to_residential, quote_to_liftgate, quote_from_address, quote_from_city, quote_from_state, quote_from_postal, quote_from_country, quote_from_pdf, quote_status, quote_created_at, quote_updated_at, quote_invoice_items | Operational/private/reference; no row export |
| rp_reel | reel_id, reel_user_id, reel_image, reel_image_path, reel_total_likes, reel_status, reel_is_featured, reel_is_new, reel_is_menu, reel_createdon | Operational/private/reference; no row export |
| rp_services | services_id, services_name, services_section, services_detail_heading, services_detail_heading_2, services_slug, services_articles, services_short_detail, services_detail, services_field_1, services_field_2, services_field_3, services_field_4, services_field_5, services_field_6, services_field_7, services_image_path, services_image, services_home_image, services_other_image, services_banner_title, services_banner_subtitle, services_page, services_url, services_position, services_is_featured, services_show_on_banner, services_status, services_createdon, services_navigation_name | Public-content candidate; filter status |
| rp_shipping_packaging | shipping_packaging_id, shipping_packaging_title, shipping_packaging_short_detail, shipping_packaging_extra, shipping_packaging_image_path, shipping_packaging_image, shipping_packaging_other_image, shipping_packaging_page, shipping_packaging_url, shipping_packaging_position, shipping_packaging_status, shipping_packaging_createdon | Public-content candidate; filter status |
| rp_signup | signup_id, signup_createdon, signup_approval_status, signup_otp, signup_verify_token, login_otp, login_otp_expires, signup_change_otp, signup_change_otp_expiry, signup_status, signup_category_id, signup_email, signup_username, signup_password, signup_profile_image_path, signup_profile_image, signup_birthday, signup_title, signup_emergency_name, signup_emergency_relationship, signup_emergency_phone, signup_emergency_address, signup_allergies, signup_height, signup_weight, signup_blood_pressure, signup_healthcare_member, signup_healthcare_dependent, signup_healthcare_healthplan, signup_healthcare_memberid, signup_primary_name, signup_primary_phone, signup_primary_location, signup_employee_group, signup_employee_company, signup_employee_payer, signup_employee_effective_date, signup_deductable_office, signup_deductable_urgent_care, signup_deductable_specialist, signup_deductable_hosp, signup_deductable_individual, signup_deductable_family, signup_rx_bin, signup_rx_pcn, signup_rx_grp, signup_rx_copay, signup_dob, signup_nameprefix, signup_gender, signup_salutation, signup_firstname, signup_lastname, signup_suffix, signup_bussiness_name, signup_bussiness_type, signup_purchacs_volume, signup_social_presence, signup_mobile, signup_telephone, signup_whatsapp, signup_fax, signup_address1, signup_address2, signup_city, signup_website, signup_company, signup_state, signup_port, signup_url, signup_support_image, signup_support_image_path, signup_notes, signup_country, signup_xp_gained, signup_role, signup_timezone, signup_subscription, signup_provider_signupname, signup_provider_uid, signup_provider_id, signup_is_admin, signup_type, signup_facebook, signup_twitter, signup_google_plus, signup_account_no, signup_is_paid, signup_transaction_message, signup_response, signup_bio, signup_working, signup_phonecode, signup_phone_approval_status | Operational/private/reference; no row export |
| rp_signup_trusted_devices | id, signup_id, device_fingerprint, created_at, last_login_at | Operational/private/reference; no row export |
| rp_states | states_id, states_code, states_name, states_country_id, states_status, states_createdon | Operational/private/reference; no row export |
| rp_subscription | subscription_id, subscription_user_id, subscription_package_id, subscription_amount, subscription_start_date, subscription_package_expire, subscription_payment_comments, subscription_response, subscription_merchant_type, subscription_payment_status, subscription_status, subscription_createdon | Operational/private/reference; no row export |
| rp_subscription_package | subscription_package_id, subscription_package_name, subscription_package_price, subscription_package_detail, subscription_package_status, subscription_package_createdon | Operational/private/reference; no row export |
| rp_testimonial | testimonial_id, testimonial_name, testimonial_detail_more, testimonial_summary, testimonial_rating, testimonial_type, testimonial_detail, testimonial_designation, testimonial_image, testimonial_image_path, testimonial_status, testimonial_createdon | Public-content candidate; filter status |
| rp_user | user_id, user_createdon, user_status, user_email, user_username, user_fname, user_lname, user_address, user_city, user_zip, user_phone, user_whatsapp, user_notes, user_password, user_profile_image_path, user_profile_image, user_role, user_is_admin, user_parent_id, user_created_by, user_state | Operational/private/reference; no row export |
| rp_what_new | what_new_id, what_new_title, what_new_field_1, what_new_field_2, what_new_field_3, what_new_detail, what_new_image_path, what_new_image, what_new_other_image, what_new_page, what_new_url, what_new_position, what_new_status, what_new_createdon | Public-content candidate; filter status |
| rp_work_process | work_process_id, work_process_title, work_process_field_1, work_process_field_2, work_process_field_3, work_process_detail, work_process_image_path, work_process_image, work_process_other_image, work_process_page, work_process_url, work_process_position, work_process_status, work_process_createdon | Public-content candidate; filter status |

Declared foreign keys:

- FOREIGN KEY (`city_state_id`) REFERENCES `rp_states` (`states_id`)


## rpns.sql: 7 tables

| Table | Columns | Classification |
| --- | --- | --- |
| auction_houses | id, name, city, is_active, created_at | Operational/private/reference; no row export |
| invoice_details | invoice_number, sale_date, warehouse, bidder_number, bidder_name, bidder_company, billing_address, city, state, zip, phone, email_id, auction_houses, checkout_status, packing_status, shipping_status, source_file | Operational/private/reference; no row export |
| item_details | id, invoice_number, lot, barcode, missing_flag, description, price, quantity, total, photo_upload_status, photo_upload_path, checkout_status, packing_status, shipping_status, auction_houses | Operational/private/reference; no row export |
| users | id, username, password, fullname, created_at | Operational/private/reference; no row export |
| zbkp_auction_house | id, name, city, is_active, created_at | Operational/private/reference; no row export |
| zbkp_invoice_details | invoice_number, sale_date, warehouse, bidder_number, bidder_name, bidder_company, billing_address, city, state, zip, phone, email_id, auction_houses, checkout_status, packing_status, shipping_status | Operational/private/reference; no row export |
| zzz_bkp_invoice_details | invoice_number, sale_date, warehouse, bidder_number, bidder_name, bidder_company, billing_address, city, state, zip, phone, email_id, auction_houses, checkout_status, packing_status, shipping_status | Operational/private/reference; no row export |

Declared foreign keys:

No declared foreign keys found.

## Logical relationships and migration boundaries

- CMS pages are selected by numeric IDs in controllers, not relational page entities. Recreate named page-section identifiers while retaining legacy ID provenance.
- rp_services.services_slug is the public URL lookup; service status controls listing eligibility. Do not assume every slug lookup enforces active status: FastAPI must enforce it explicitly.
- rp_inner_banner IDs 1–8 map About, Services, Reviews, How It Works, Contact, Account, Terms, Privacy. rp_banner supplies Home; rp_logo supplies shared branding.
- rp_config is key/value public settings in this snapshot; whitelist only approved public keys rather than exposing a complete configuration endpoint.
- rp_quote.quote_user_id logically links rp_signup.signup_id; quote_invoice_items is denormalized workflow data, not public CMS.
- rp_signup_trusted_devices.signup_id logically links rp_signup; rp_subscription user/package IDs link signup/package records. These logical links need integrity validation; do not assume database FKs.
- rpns.item_details.invoice_number logically links invoice_details.invoice_number; auction house references and stage flags belong to the operational system. Buyer/customer fields and payment/invoice data must remain private.
- rp_ci_sessions stores serialized sessions; do not migrate sessions, OTPs or trusted-device credentials into public content. Use explicit authentication migration/re-login.
- Historical/bkp invoice tables are not authoritative without operational owner confirmation.

## Public content counts

| Table | Records parsed | Status=1 |
| --- | --- | --- |
| rp_cms_page | 24 | 24 |
| rp_services | 7 | 4 |
| rp_testimonial | 5 | 4 |
| rp_banner | 1 | 1 |
| rp_inner_banner | 8 | 8 |
| rp_logo | 1 | 1 |
| rp_shipping_packaging | 6 | 6 |
| rp_what_new | 6 | 6 |
| rp_work_process | 3 | 3 |
| rp_faq | 0 | 0 |

24 CMS rows include one account welcome record; only 1–23 are transcribed. Four services and four testimonials are active. `rp_faq` has schema but no recovered rows. Publication status on auxiliary tables or direct detail routes requires controller/model validation. Current website content is recoverable offline; operational completeness and consistency require a separate authorized migration plan, not importing these dumps.

## Storage and key metadata

- `rapidpacknship_live_db.sql`: engines {'InnoDB': 28, 'MyISAM': 1}; ALTER clauses contain 29 primary keys, 3 unique keys and 18 ordinary keys. These counts describe declared schema, not verified live constraints.
- `rpns.sql`: engines {'InnoDB': 7}; ALTER clauses contain 4 primary keys, 4 unique keys and 0 ordinary keys. These counts describe declared schema, not verified live constraints.

Public CMS bodies/descriptions are SQL text/HTML fields; IDs/status/order columns are numeric; slugs, media paths and setting keys are character fields. Treat uploaded images/video URLs and CMS links as data requiring validation. Exact SQL DDL remains in the read-only source; no migration SQL was copied into this repository.
