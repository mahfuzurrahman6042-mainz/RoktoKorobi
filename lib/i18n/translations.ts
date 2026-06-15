// Centralized Translation Structure for RoktoKorobi
// This file contains all translation keys for English and Bengali

export type Language = 'en' | 'bn';

export interface Translations {
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    view: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    search: string;
    filter: string;
    sort: string;
    all: string;
    none: string;
    yes: string;
    no: string;
    or: string;
    and: string;
  };
  nav: {
    home: string;
    donors: string;
    request: string;
    dashboard: string;
    login: string;
    signup: string;
    logout: string;
    profile: string;
    admin: string;
    about: string;
    contact: string;
    blog: string;
    testimonials: string;
    gallery: string;
    features: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    badge: string;
  };
  mission: {
    title: string;
    line1: string;
    line2: string;
    line3: string;
    subtitle: string;
    description: string;
  };
  stats: {
    registeredDonors: string;
    requestsFulfilled: string;
    partnerOrganizations: string;
  };
  map: {
    title: string;
    subtitle: string;
    findDonor: string;
    lifeSaver: string;
    closeTo: string;
    you: string;
    loading: string;
    error: string;
    empty: string;
  };
  bloodRequest: {
    title: string;
    patientName: string;
    bloodGroup: string;
    hospital: string;
    district: string;
    phone: string;
    urgency: string;
    urgencyLow: string;
    urgencyMedium: string;
    urgencyHigh: string;
    urgencyCritical: string;
    message: string;
    requiredDate: string;
    submit: string;
    success: string;
    error: string;
  };
  donor: {
    title: string;
    name: string;
    bloodGroup: string;
    district: string;
    phone: string;
    age: string;
    weight: string;
    lastDonation: string;
    available: string;
    notAvailable: string;
    contact: string;
  };
  eligibility: {
    title: string;
    age: string;
    weight: string;
    health: string;
    diseases: string;
    medications: string;
    travel: string;
    tattoo: string;
    checkEligibility: string;
    eligible: string;
    notEligible: string;
  };
  auth: {
    login: string;
    signup: string;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    phone: string;
    bloodGroup: string;
    district: string;
    age: string;
    weight: string;
    forgotPassword: string;
    resetPassword: string;
    rememberMe: string;
    orContinueWith: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    loginSuccess: string;
    signupSuccess: string;
    loginError: string;
    signupError: string;
    invalidCredentials: string;
    emailExists: string;
    passwordMismatch: string;
  };
  dashboard: {
    title: string;
    welcome: string;
    myRequests: string;
    myDonations: string;
    myProfile: string;
    statistics: string;
    recentActivity: string;
    settings: string;
    notifications: string;
    noRequests: string;
    noDonations: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
    shareYourStory: string;
    readStory: string;
    name: string;
    role: string;
    quote: string;
    submit: string;
    success: string;
    error: string;
    noTestimonials: string;
    beFirst: string;
  };
  blog: {
    title: string;
    subtitle: string;
    latestPosts: string;
    readMore: string;
    allPosts: string;
    category: string;
    tags: string;
    author: string;
    date: string;
    noPosts: string;
  };
  gallery: {
    title: string;
    subtitle: string;
    viewFullGallery: string;
    artwork: string;
    artist: string;
    title: string;
    noArtworks: string;
  };
  features: {
    title: string;
    subtitle: string;
    findDonors: string;
    requestBlood: string;
    trackDonations: string;
    emergencyAlert: string;
    community: string;
    education: string;
  };
  footer: {
    about: string;
    quickLinks: string;
    contact: string;
    social: string;
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
  };
  errors: {
    pageNotFound: string;
    serverError: string;
    unauthorized: string;
    forbidden: string;
    somethingWentWrong: string;
    tryAgain: string;
    goHome: string;
  };
  validation: {
    required: string;
    email: string;
    minLength: string;
    maxLength: string;
    pattern: string;
    invalid: string;
  };
  urgency: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };
  bloodGroups: {
    aPositive: string;
    aNegative: string;
    bPositive: string;
    bNegative: string;
    abPositive: string;
    abNegative: string;
    oPositive: string;
    oNegative: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      all: 'All',
      none: 'None',
      yes: 'Yes',
      no: 'No',
      or: 'or',
      and: 'and',
    },
    nav: {
      home: 'Home',
      donors: 'Find Donors',
      request: 'Request Blood',
      dashboard: 'Dashboard',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      profile: 'Profile',
      admin: 'Admin',
      about: 'About',
      contact: 'Contact',
      blog: 'Blog',
      testimonials: 'Testimonials',
      gallery: 'Gallery',
      features: 'Features',
    },
    hero: {
      title: 'Every Drop Saves Lives',
      subtitle: 'Connect. Donate. Save a Life.',
      ctaPrimary: 'Need Blood?',
      ctaSecondary: 'Become a Donor',
      badge: 'Emergency Blood Request',
    },
    mission: {
      title: 'Our Mission',
      line1: 'Every Drop',
      line2: 'Of Blood',
      line3: 'Saves Life',
      subtitle: 'Connect. Donate. Save a Life.',
      description: 'Roktokorobi is a digital platform that connects blood donors with people in urgent need of blood transfusions.',
    },
    stats: {
      registeredDonors: 'Registered Donors',
      requestsFulfilled: 'Requests Fulfilled',
      partnerOrganizations: 'Partner Organisations',
    },
    map: {
      title: 'Find a Life Saver Close to You',
      subtitle: 'Locate blood donors near you using our interactive map',
      findDonor: 'Find a',
      lifeSaver: 'Life Saver',
      closeTo: 'Close to',
      you: 'You',
      loading: 'Loading map...',
      error: 'Failed to load map',
      empty: 'No donors found in this area',
    },
    bloodRequest: {
      title: 'Request Blood',
      patientName: 'Patient Name',
      bloodGroup: 'Blood Group',
      hospital: 'Hospital Name',
      district: 'District',
      phone: 'Phone Number',
      urgency: 'Urgency Level',
      urgencyLow: 'Low',
      urgencyMedium: 'Medium',
      urgencyHigh: 'High',
      urgencyCritical: 'Critical',
      message: 'Additional Message',
      requiredDate: 'Required Date',
      submit: 'Submit Request',
      success: 'Blood request submitted successfully',
      error: 'Failed to submit blood request',
    },
    donor: {
      title: 'Donor Information',
      name: 'Name',
      bloodGroup: 'Blood Group',
      district: 'District',
      phone: 'Phone',
      age: 'Age',
      weight: 'Weight (kg)',
      lastDonation: 'Last Donation',
      available: 'Available',
      notAvailable: 'Not Available',
      contact: 'Contact',
    },
    eligibility: {
      title: 'Check Your Eligibility',
      age: 'Age: 18-65 years',
      weight: 'Weight: At least 50 kg',
      health: 'Good general health',
      diseases: 'No infectious diseases',
      medications: 'Not on certain medications',
      travel: 'No recent travel to malaria-risk areas',
      tattoo: 'No recent tattoo or piercing',
      checkEligibility: 'Check Eligibility',
      eligible: 'You are eligible to donate blood',
      notEligible: 'You are not eligible to donate blood',
    },
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Full Name',
      phone: 'Phone Number',
      bloodGroup: 'Blood Group',
      district: 'District',
      age: 'Age',
      weight: 'Weight (kg)',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      rememberMe: 'Remember me',
      orContinueWith: 'or continue with',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      loginSuccess: 'Login successful',
      signupSuccess: 'Registration successful',
      loginError: 'Login failed',
      signupError: 'Registration failed',
      invalidCredentials: 'Invalid email or password',
      emailExists: 'Email already registered',
      passwordMismatch: 'Passwords do not match',
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back',
      myRequests: 'My Requests',
      myDonations: 'My Donations',
      myProfile: 'My Profile',
      statistics: 'Statistics',
      recentActivity: 'Recent Activity',
      settings: 'Settings',
      notifications: 'Notifications',
      noRequests: 'No blood requests yet',
      noDonations: 'No donations recorded yet',
    },
    testimonials: {
      title: 'RoktoKorobi Experience',
      subtitle: 'Real, moving stories from donors and patients touched by the gift of blood.',
      shareYourStory: 'Share Your Story',
      readStory: 'Read Story',
      name: 'Name',
      role: 'Role',
      quote: 'Your story',
      submit: 'Submit Story',
      success: 'Story submitted successfully',
      error: 'Failed to submit story',
      noTestimonials: 'No testimonials yet',
      beFirst: 'Be the first to share your story!',
    },
    blog: {
      title: 'Blog',
      subtitle: 'Discover articles, guides, and stories about blood donation.',
      latestPosts: 'Latest Posts',
      readMore: 'Read More →',
      allPosts: 'See All Posts',
      category: 'Category',
      tags: 'Tags',
      author: 'Author',
      date: 'Date',
      noPosts: 'No blog posts yet',
    },
    gallery: {
      title: 'Chitrokothon',
      subtitle: 'Artwork by our community, created in the spirit of saving lives.',
      viewFullGallery: 'View Full Gallery',
      artwork: 'Artwork',
      artist: 'Artist',
      title: 'Title',
      noArtworks: 'No artworks yet',
    },
    features: {
      title: 'Features',
      subtitle: 'Everything you need to save lives',
      findDonors: 'Find Donors',
      requestBlood: 'Request Blood',
      trackDonations: 'Track Donations',
      emergencyAlert: 'Emergency Alert',
      community: 'Community',
      education: 'Education',
    },
    footer: {
      about: 'About',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      social: 'Social',
      copyright: '© 2026 RoktoKorobi. All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
    },
    errors: {
      pageNotFound: 'Page Not Found',
      serverError: 'Server Error',
      unauthorized: 'Unauthorized',
      forbidden: 'Forbidden',
      somethingWentWrong: 'Something went wrong',
      tryAgain: 'Please try again',
      goHome: 'Go Home',
    },
    validation: {
      required: 'This field is required',
      email: 'Invalid email address',
      minLength: 'Must be at least {min} characters',
      maxLength: 'Must be less than {max} characters',
      pattern: 'Invalid format',
      invalid: 'Invalid value',
    },
    urgency: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    },
    bloodGroups: {
      aPositive: 'A+',
      aNegative: 'A-',
      bPositive: 'B+',
      bNegative: 'B-',
      abPositive: 'AB+',
      abNegative: 'AB-',
      oPositive: 'O+',
      oNegative: 'O-',
    },
  },
  bn: {
    common: {
      loading: 'লোড হচ্ছে...',
      error: 'একটি ত্রুটি ঘটেছে',
      retry: 'আবার চেষ্টা করুন',
      cancel: 'বাতিল',
      save: 'সংরক্ষণ',
      delete: 'মুছুন',
      edit: 'সম্পাদনা',
      view: 'দেখুন',
      close: 'বন্ধ',
      back: 'ফিরে যান',
      next: 'পরবর্তী',
      previous: 'পূর্ববর্তী',
      submit: 'জমা দিন',
      search: 'অনুসন্ধান',
      filter: 'ফিল্টার',
      sort: 'সাজান',
      all: 'সব',
      none: 'কোনটিই নয়',
      yes: 'হ্যাঁ',
      no: 'না',
      or: 'অথবা',
      and: 'এবং',
    },
    nav: {
      home: 'হোম',
      donors: 'দাতা খুঁজুন',
      request: 'রক্তের প্রয়োজন',
      dashboard: 'ড্যাশবোর্ড',
      login: 'লগইন',
      signup: 'সাইন আপ',
      logout: 'লগআউট',
      profile: 'প্রোফাইল',
      admin: 'অ্যাডমিন',
      about: 'সম্পর্কে',
      contact: 'যোগাযোগ',
      blog: 'ব্লগ',
      testimonials: 'সাক্ষ্য',
      gallery: 'গ্যালারি',
      features: 'বৈশিষ্ট্য',
    },
    hero: {
      title: 'প্রতিটি ফোঁটা রক্তের জীবন বাঁচায়',
      subtitle: 'সংযোগ স্থাপন করুন, জীবন বাঁচান',
      ctaPrimary: 'রক্তের প্রয়োজন?',
      ctaSecondary: 'দাতা হন',
      badge: 'জরুরি রক্তের প্রয়োজন',
    },
    mission: {
      title: 'আমাদের মিশন',
      line1: 'প্রতিটি ফোঁটা',
      line2: 'রক্তের',
      line3: 'জীবন বাঁচায়',
      subtitle: 'সংযোগ স্থাপন করুন, জীবন বাঁচান',
      description: 'রক্তকরবী হল একটি ডিজিটাল প্ল্যাটফর্ম যা রক্তদাতাদের সাথে রক্তের প্রয়োজনে থাকা মানুষদের সংযোগ করি।',
    },
    stats: {
      registeredDonors: 'নিবন্ধিত দাতা',
      requestsFulfilled: 'পূর্ণ অনুরোধ',
      partnerOrganizations: 'অংশীদার সংস্থা',
    },
    map: {
      title: 'কাছের জীবনদাতাকে খুঁজে নিন',
      subtitle: 'আমাদের ইন্টারেক্টিভ ম্যাপ ব্যবহার করে আপনার কাছের রক্তদাতা খুঁজুন',
      findDonor: 'কাছের',
      lifeSaver: 'জীবনদাতাকে',
      closeTo: 'খুঁজে নিন',
      you: '',
      loading: 'ম্যাপ লোড হচ্ছে...',
      error: 'ম্যাপ লোড করতে ব্যর্থ',
      empty: 'এই এলাকায় কোন দাতা পাওয়া যায়নি',
    },
    bloodRequest: {
      title: 'রক্তের অনুরোধ',
      patientName: 'রোগীর নাম',
      bloodGroup: 'রক্তের গ্রুপ',
      hospital: 'হাসপাতালের নাম',
      district: 'জেলা',
      phone: 'ফোন নম্বর',
      urgency: 'জরুরি স্তর',
      urgencyLow: 'নিম্ন',
      urgencyMedium: 'মাঝারি',
      urgencyHigh: 'উচ্চ',
      urgencyCritical: 'সংকটাপন্ন',
      message: 'অতিরিক্ত বার্তা',
      requiredDate: 'প্রয়োজনীয় তারিখ',
      submit: 'জমা দিন',
      success: 'রক্তের অনুরোধ সফলভাবে জমা হয়েছে',
      error: 'রক্তের অনুরোধ জমা দিতে ব্যর্থ',
    },
    donor: {
      title: 'দাতা তথ্য',
      name: 'নাম',
      bloodGroup: 'রক্তের গ্রুপ',
      district: 'জেলা',
      phone: 'ফোন',
      age: 'বয়স',
      weight: 'ওজন (কেজি)',
      lastDonation: 'শেষ দান',
      available: 'উপলব্ধ',
      notAvailable: 'উপলব্ধ নয়',
      contact: 'যোগাযোগ',
    },
    eligibility: {
      title: 'আপনার যোগ্যতা পরীক্ষা করুন',
      age: 'বয়স: ১৮-৬৫ বছর',
      weight: 'ওজন: অন্তত ৫০ কেজি',
      health: 'ভাল সাধারণ স্বাস্থ্য',
      diseases: 'কোন সংক্রামক রোগ নেই',
      medications: 'নির্দিষ্ট ওষুধে নয়',
      travel: 'সম্প্রতি ম্যালেরিয়া-ঝুঁকিপূর্ণ এলাকায় ভ্রমণ করেননি',
      tattoo: 'সম্প্রতি ট্যাটু বা পিয়ার্সিং করেননি',
      checkEligibility: 'যোগ্যতা পরীক্ষা করুন',
      eligible: 'আপনি রক্তদানের জন্য যোগ্য',
      notEligible: 'আপনি রক্তদানের জন্য যোগ্য নয়',
    },
    auth: {
      login: 'লগইন',
      signup: 'সাইন আপ',
      email: 'ইমেইল',
      password: 'পাসওয়ার্ড',
      confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
      name: 'পূর্ণ নাম',
      phone: 'ফোন নম্বর',
      bloodGroup: 'রক্তের গ্রুপ',
      district: 'জেলা',
      age: 'বয়স',
      weight: 'ওজন (কেজি)',
      forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
      resetPassword: 'পাসওয়ার্ড রিসেট',
      rememberMe: 'আমাকে মনে রাখুন',
      orContinueWith: 'অথবা চালিয়ে যান',
      alreadyHaveAccount: 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?',
      dontHaveAccount: 'অ্যাকাউন্ট নেই?',
      loginSuccess: 'লগইন সফল',
      signupSuccess: 'নিবন্ধন সফল',
      loginError: 'লগইন ব্যর্থ',
      signupError: 'নিবন্ধন ব্যর্থ',
      invalidCredentials: 'অবৈধ ইমেইল বা পাসওয়ার্ড',
      emailExists: 'ইমেইল ইতিমধ্যে নিবন্ধিত',
      passwordMismatch: 'পাসওয়ার্ড মেলেনি',
    },
    dashboard: {
      title: 'ড্যাশবোর্ড',
      welcome: 'স্বাগতম',
      myRequests: 'আমার অনুরোধ',
      myDonations: 'আমার দান',
      myProfile: 'আমার প্রোফাইল',
      statistics: 'পরিসংখ্যান',
      recentActivity: 'সাম্প্রতিক কার্যকলাপ',
      settings: 'সেটিংস',
      notifications: 'নোটিফিকেশন',
      noRequests: 'এখনো কোন রক্তের অনুরোধ নেই',
      noDonations: 'এখনো কোন দান রেকর্ড করা হয়নি',
    },
    testimonials: {
      title: 'রক্তকরবী অভিজ্ঞতা',
      subtitle: 'রক্তের উপহারে স্পর্শিত দাতা এবং রোগীদের বাস্তব, আন্দোলিত গল্প।',
      shareYourStory: 'আপনার গল্প শেয়ার করুন',
      readStory: 'গল্প পড়ুন',
      name: 'নাম',
      role: 'ভূমিকা',
      quote: 'আপনার গল্প',
      submit: 'গল্প জমা দিন',
      success: 'গল্প সফলভাবে জমা হয়েছে',
      error: 'গল্প জমা দিতে ব্যর্থ',
      noTestimonials: 'এখনো কোন সাক্ষ্য নেই',
      beFirst: 'প্রথম হিসেবে আপনার গল্প শেয়ার করুন!',
    },
    blog: {
      title: 'ব্লগ',
      subtitle: 'রক্তদান সম্পর্কে নিবন্ধ, গাইড এবং গল্প আবিষ্কার করুন।',
      latestPosts: 'সর্বশেষ পোস্ট',
      readMore: 'আরও পড়ুন →',
      allPosts: 'সব পোস্ট দেখুন',
      category: 'বিভাগ',
      tags: 'ট্যাগ',
      author: 'লেখক',
      date: 'তারিখ',
      noPosts: 'এখনো কোন ব্লগ পোস্ট নেই',
    },
    gallery: {
      title: 'চিত্রকথন',
      subtitle: 'জীবন বাঁচানোর আত্মায় তৈরি আমাদের সম্প্রদায়ের শিল্পকর্ম।',
      viewFullGallery: 'সম্পূর্ণ গ্যালারি দেখুন',
      artwork: 'শিল্পকর্ম',
      artist: 'শিল্পী',
      title: 'শিরোনাম',
      noArtworks: 'এখনো কোন শিল্পকর্ম নেই',
    },
    features: {
      title: 'বৈশিষ্ট্য',
      subtitle: 'জীবন বাঁচাতে আপনার যা প্রয়োজন',
      findDonors: 'দাতা খুঁজুন',
      requestBlood: 'রক্তের অনুরোধ',
      trackDonations: 'দান ট্র্যাক করুন',
      emergencyAlert: 'জরুরি সতর্কতা',
      community: 'সম্প্রদায়',
      education: 'শিক্ষা',
    },
    footer: {
      about: 'সম্পর্কে',
      quickLinks: 'দ্রুত লিঙ্ক',
      contact: 'যোগাযোগ',
      social: 'সোশ্যাল',
      copyright: '© ২০২৬ রক্তকরবী। সর্বস্বত্ব সংরক্ষিত।',
      privacyPolicy: 'গোপনীয়তা নীতি',
      termsOfService: 'ব্যবহারের শর্তাবলী',
    },
    errors: {
      pageNotFound: 'পেজ পাওয়া যায়নি',
      serverError: 'সার্ভার ত্রুটি',
      unauthorized: 'অননুমোদিত',
      forbidden: 'নিষিদ্ধ',
      somethingWentWrong: 'কিছু ভুল হয়েছে',
      tryAgain: 'আবার চেষ্টা করুন',
      goHome: 'হোমে যান',
    },
    validation: {
      required: 'এই ক্ষেত্রটি প্রয়োজন',
      email: 'অবৈধ ইমেইল ঠিকানা',
      minLength: 'অন্তত {min} অক্ষর হতে হবে',
      maxLength: '{max} অক্ষরের কম হতে হবে',
      pattern: 'অবৈধ ফরম্যাট',
      invalid: 'অবৈধ মান',
    },
    urgency: {
      low: 'নিম্ন',
      medium: 'মাঝারি',
      high: 'উচ্চ',
      critical: 'সংকটাপন্ন',
    },
    bloodGroups: {
      aPositive: 'এ+',
      aNegative: 'এ-',
      bPositive: 'বি+',
      bNegative: 'বি-',
      abPositive: 'এবি+',
      abNegative: 'এবি-',
      oPositive: 'ও+',
      oNegative: 'ও-',
    },
  },
};

// Helper function to get translation
export function t(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

// Helper function to get all translations for a language
export function getTranslations(lang: Language): Translations {
  return translations[lang];
}
