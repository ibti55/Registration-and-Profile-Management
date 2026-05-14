-- BPSC Registration & Profile Management - Seed Data
-- Migration: 002_seed_data.sql

BEGIN;

-- ============================================================
-- EDUCATION BOARDS
-- ============================================================
INSERT INTO education_boards (name, name_bn) VALUES
  ('Dhaka', 'ঢাকা'),
  ('Rajshahi', 'রাজশাহী'),
  ('Chittagong', 'চট্টগ্রাম'),
  ('Jessore', 'যশোর'),
  ('Comilla', 'কুমিল্লা'),
  ('Sylhet', 'সিলেট'),
  ('Dinajpur', 'দিনাজপুর'),
  ('Barisal', 'বরিশাল'),
  ('Mymensingh', 'ময়মনসিংহ'),
  ('Madrasah', 'মাদ্রাসা'),
  ('Technical', 'কারিগরি');

-- ============================================================
-- DISTRICTS (Selected major districts)
-- ============================================================
INSERT INTO districts (name, name_bn, division, division_bn) VALUES
  ('Dhaka', 'ঢাকা', 'Dhaka', 'ঢাকা'),
  ('Gazipur', 'গাজীপুর', 'Dhaka', 'ঢাকা'),
  ('Narayanganj', 'নারায়ণগঞ্জ', 'Dhaka', 'ঢাকা'),
  ('Tangail', 'টাঙ্গাইল', 'Dhaka', 'ঢাকা'),
  ('Munshiganj', 'মুন্সীগঞ্জ', 'Dhaka', 'ঢাকা'),
  ('Manikganj', 'মানিকগঞ্জ', 'Dhaka', 'ঢাকা'),
  ('Narsingdi', 'নরসিংদী', 'Dhaka', 'ঢাকা'),
  ('Faridpur', 'ফরিদপুর', 'Dhaka', 'ঢাকা'),
  ('Chittagong', 'চট্টগ্রাম', 'Chittagong', 'চট্টগ্রাম'),
  ('Comilla', 'কুমিল্লা', 'Chittagong', 'চট্টগ্রাম'),
  ('Noakhali', 'নোয়াখালী', 'Chittagong', 'চট্টগ্রাম'),
  ('Feni', 'ফেনী', 'Chittagong', 'চট্টগ্রাম'),
  ('Rajshahi', 'রাজশাহী', 'Rajshahi', 'রাজশাহী'),
  ('Bogra', 'বগুড়া', 'Rajshahi', 'রাজশাহী'),
  ('Pabna', 'পাবনা', 'Rajshahi', 'রাজশাহী'),
  ('Natore', 'নাটোর', 'Rajshahi', 'রাজশাহী'),
  ('Khulna', 'খুলনা', 'Khulna', 'খুলনা'),
  ('Jessore', 'যশোর', 'Khulna', 'খুলনা'),
  ('Satkhira', 'সাতক্ষীরা', 'Khulna', 'খুলনা'),
  ('Barisal', 'বরিশাল', 'Barisal', 'বরিশাল'),
  ('Patuakhali', 'পটুয়াখালী', 'Barisal', 'বরিশাল'),
  ('Sylhet', 'সিলেট', 'Sylhet', 'সিলেট'),
  ('Moulvibazar', 'মৌলভীবাজার', 'Sylhet', 'সিলেট'),
  ('Rangpur', 'রংপুর', 'Rangpur', 'রংপুর'),
  ('Dinajpur', 'দিনাজপুর', 'Rangpur', 'রংপুর'),
  ('Mymensingh', 'ময়মনসিংহ', 'Mymensingh', 'ময়মনসিংহ'),
  ('Jamalpur', 'জামালপুর', 'Mymensingh', 'ময়মনসিংহ');

-- ============================================================
-- UPAZILLAS (Selected)
-- ============================================================
INSERT INTO upazillas (district_id, name, name_bn) VALUES
  (1, 'Dhanmondi', 'ধানমন্ডি'),
  (1, 'Gulshan', 'গুলশান'),
  (1, 'Mirpur', 'মিরপুর'),
  (1, 'Mohammadpur', 'মোহাম্মদপুর'),
  (1, 'Uttara', 'উত্তরা'),
  (1, 'Lalbagh', 'লালবাগ'),
  (2, 'Gazipur Sadar', 'গাজীপুর সদর'),
  (2, 'Tongi', 'টঙ্গী'),
  (9, 'Chittagong City', 'চট্টগ্রাম সিটি'),
  (13, 'Rajshahi City', 'রাজশাহী সিটি');

-- ============================================================
-- UNIVERSITIES (Selected)
-- ============================================================
INSERT INTO universities (name, name_bn) VALUES
  ('University of Dhaka', 'ঢাকা বিশ্ববিদ্যালয়'),
  ('Bangladesh University of Engineering and Technology (BUET)', 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয়'),
  ('University of Rajshahi', 'রাজশাহী বিশ্ববিদ্যালয়'),
  ('University of Chittagong', 'চট্টগ্রাম বিশ্ববিদ্যালয়'),
  ('Jahangirnagar University', 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়'),
  ('Bangladesh Agricultural University', 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয়'),
  ('Islamic University', 'ইসলামী বিশ্ববিদ্যালয়'),
  ('Shahjalal University of Science and Technology', 'শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়'),
  ('Khulna University', 'খুলনা বিশ্ববিদ্যালয়'),
  ('National University', 'জাতীয় বিশ্ববিদ্যালয়'),
  ('Open University', 'উন্মুক্ত বিশ্ববিদ্যালয়'),
  ('BRAC University', 'ব্র্যাক বিশ্ববিদ্যালয়'),
  ('North South University', 'নর্থ সাউথ বিশ্ববিদ্যালয়'),
  ('Independent University Bangladesh', 'ইন্ডিপেন্ডেন্ট ইউনিভার্সিটি'),
  ('East West University', 'ইস্ট ওয়েস্ট বিশ্ববিদ্যালয়');

-- ============================================================
-- SUBJECTS (Selected)
-- ============================================================
INSERT INTO subjects (name, name_bn, level) VALUES
  ('Bangla', 'বাংলা', 'graduation'),
  ('English', 'ইংরেজি', 'graduation'),
  ('Mathematics', 'গণিত', 'graduation'),
  ('Physics', 'পদার্থবিজ্ঞান', 'graduation'),
  ('Chemistry', 'রসায়ন', 'graduation'),
  ('Computer Science & Engineering', 'কম্পিউটার সায়েন্স এন্ড ইঞ্জিনিয়ারিং', 'graduation'),
  ('Electrical & Electronic Engineering', 'ইলেক্ট্রিক্যাল এন্ড ইলেক্ট্রনিক ইঞ্জিনিয়ারিং', 'graduation'),
  ('Economics', 'অর্থনীতি', 'graduation'),
  ('Political Science', 'রাষ্ট্রবিজ্ঞান', 'graduation'),
  ('History', 'ইতিহাস', 'graduation'),
  ('Law', 'আইন', 'graduation'),
  ('Medicine (MBBS)', 'মেডিসিন (এমবিবিএস)', 'graduation'),
  ('Accounting', 'হিসাববিজ্ঞান', 'graduation'),
  ('Management', 'ব্যবস্থাপনা', 'graduation'),
  ('Marketing', 'মার্কেটিং', 'graduation');

-- ============================================================
-- SAMPLE CIRCULAR (For testing)
-- ============================================================
INSERT INTO circulars (title, title_bn, description, description_bn, exam_type, application_start_date, application_end_date, exam_date, fee_amount, is_published, is_active, eligibility_criteria, posts, cadre_options) VALUES
  (
    '46th BCS Examination',
    '৪৬তম বিসিএস পরীক্ষা',
    'Bangladesh Civil Service (BCS) Examination for the recruitment of cadre service officials.',
    'ক্যাডার সার্ভিস কর্মকর্তা নিয়োগের জন্য বাংলাদেশ সিভিল সার্ভিস (বিসিএস) পরীক্ষা।',
    'bcs_cadre',
    '2026-06-01 00:00:00+06',
    '2026-07-31 23:59:59+06',
    '2026-10-15 10:00:00+06',
    1000.00,
    TRUE,
    TRUE,
    '{"min_age": 21, "max_age": 30, "min_education": "graduation"}',
    '[]',
    '[{"type": "general", "name": "General Cadre"}, {"type": "technical", "name": "Technical/Professional Cadre"}]'
  ),
  (
    'Non-Cadre Post Recruitment 2026',
    'নন-ক্যাডার পদে নিয়োগ ২০২৬',
    'Recruitment to various non-cadre government positions.',
    'বিভিন্ন নন-ক্যাডার সরকারি পদে নিয়োগ।',
    'non_cadre',
    '2026-07-01 00:00:00+06',
    '2026-08-31 23:59:59+06',
    '2026-11-20 10:00:00+06',
    500.00,
    TRUE,
    TRUE,
    '{"min_age": 18, "max_age": 30, "min_education": "hsc"}',
    '[{"id": 1, "name": "Assistant", "vacancies": 50}, {"id": 2, "name": "Upper Division Clerk", "vacancies": 100}]',
    '[]'
  );

COMMIT;
