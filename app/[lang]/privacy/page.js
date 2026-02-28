import Link from 'next/link'

export const metadata = {
    title: 'Privacy Policy | GoHoliday',
    description: 'Privacy Policy for GoHoliday - Learn how we collect, use, and protect your personal information.',
    alternates: {
        canonical: '/en/privacy' // Note: This is a static page, so defaulting to en for global, or we need dynamic metadata. Let's make it dynamic.
    }
}

export default async function PrivacyPolicyPage({ params }) {
    const { lang } = await params

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-950 text-white">
                <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm text-gray-300 mb-6">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Legal Document
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-lg text-gray-300">
                            Your privacy is important to us. This policy explains how GoHoliday collects, uses, and safeguards your information.
                        </p>
                        <p className="text-sm text-gray-400 mt-4">Last updated: February 20, 2026</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 sm:p-10 space-y-10">

                            {/* Section 1 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">1</div>
                                    <h2 className="text-xl font-bold text-gray-900">Information We Collect</h2>
                                </div>
                                <div className="text-gray-600 leading-relaxed space-y-3 pl-11">
                                    <p>We collect information you provide directly to us when using our services, including:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Personal Information:</strong> Name, email address, phone number, and other contact details when you make a booking or create an account.</li>
                                        <li><strong>Booking Information:</strong> Tour preferences, travel dates, number of guests, special requests, and payment-related information.</li>
                                        <li><strong>Communication Data:</strong> Messages, inquiries, and correspondence you send to us through our contact forms or preferred contact methods (email, WhatsApp).</li>
                                        <li><strong>Account Data:</strong> Login credentials and profile information if you create an account with GoHoliday.</li>
                                        <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited, features used, and browsing patterns.</li>
                                    </ul>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Section 2 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">2</div>
                                    <h2 className="text-xl font-bold text-gray-900">How We Use Your Information</h2>
                                </div>
                                <div className="text-gray-600 leading-relaxed space-y-3 pl-11">
                                    <p>We use the information we collect for the following purposes:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Service Delivery:</strong> To process and manage your tour bookings, reservations, and travel arrangements.</li>
                                        <li><strong>Communication:</strong> To contact you regarding your bookings, respond to inquiries, and send important service-related notifications.</li>
                                        <li><strong>Personalization:</strong> To customize your experience, provide tailored recommendations, and remember your preferences.</li>
                                        <li><strong>Improvement:</strong> To analyze usage patterns and improve our website, services, and customer experience.</li>
                                        <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal obligations.</li>
                                    </ul>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Section 3 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">3</div>
                                    <h2 className="text-xl font-bold text-gray-900">Information Sharing & Disclosure</h2>
                                </div>
                                <div className="text-gray-600 leading-relaxed space-y-3 pl-11">
                                    <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our website, processing payments, and delivering tours (e.g., tour operators, payment processors).</li>
                                        <li><strong>Legal Requirements:</strong> When required by law, regulation, legal process, or governmental request.</li>
                                        <li><strong>Safety:</strong> To protect the rights, property, and safety of GoHoliday, our customers, or others.</li>
                                        <li><strong>Consent:</strong> With your explicit consent for any other purpose not described in this policy.</li>
                                    </ul>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Section 4 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">4</div>
                                    <h2 className="text-xl font-bold text-gray-900">Data Security</h2>
                                </div>
                                <div className="text-gray-600 leading-relaxed space-y-3 pl-11">
                                    <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>Encryption of data in transit using SSL/TLS protocols.</li>
                                        <li>Secure authentication mechanisms for user accounts.</li>
                                        <li>Regular security assessments and updates to our systems.</li>
                                        <li>Access controls to limit employee access to personal data on a need-to-know basis.</li>
                                    </ul>
                                    <p>While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.</p>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Section 5 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">5</div>
                                    <h2 className="text-xl font-bold text-gray-900">Cookies & Tracking Technologies</h2>
                                </div>
                                <div className="text-gray-600 leading-relaxed space-y-3 pl-11">
                                    <p>Our website uses cookies and similar tracking technologies to enhance your browsing experience. Cookies are small data files stored on your device. We use:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Essential Cookies:</strong> Required for the website to function properly (e.g., authentication, session management).</li>
                                        <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website to improve performance and content.</li>
                                        <li><strong>Preference Cookies:</strong> Remember your settings and preferences, such as language and currency selection.</li>
                                    </ul>
                                    <p>You can manage cookie preferences through your browser settings. Disabling certain cookies may affect website functionality.</p>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Section 6 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">6</div>
                                    <h2 className="text-xl font-bold text-gray-900">Your Rights</h2>
                                </div>
                                <div className="text-gray-600 leading-relaxed space-y-3 pl-11">
                                    <p>Depending on your location, you may have the following rights regarding your personal information:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                                        <li><strong>Correction:</strong> Request correction of inaccurate or incomplete personal data.</li>
                                        <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal obligations.</li>
                                        <li><strong>Restriction:</strong> Request restriction of processing of your personal data in certain circumstances.</li>
                                        <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format.</li>
                                        <li><strong>Objection:</strong> Object to the processing of your personal data for certain purposes.</li>
                                    </ul>
                                    <p>To exercise any of these rights, please contact us using the information provided below.</p>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Section 7 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">7</div>
                                    <h2 className="text-xl font-bold text-gray-900">Data Retention</h2>
                                </div>
                                <div className="text-gray-600 leading-relaxed space-y-3 pl-11">
                                    <p>We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements. Booking records may be retained for a reasonable period after your trip for customer service, legal compliance, and dispute resolution purposes.</p>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Section 8 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">8</div>
                                    <h2 className="text-xl font-bold text-gray-900">Third-Party Links</h2>
                                </div>
                                <div className="text-gray-600 leading-relaxed space-y-3 pl-11">
                                    <p>Our website may contain links to third-party websites or services that are not operated by GoHoliday. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services. We encourage you to review the privacy policy of every site you visit.</p>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Section 9 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">9</div>
                                    <h2 className="text-xl font-bold text-gray-900">Children&apos;s Privacy</h2>
                                </div>
                                <div className="text-gray-600 leading-relaxed space-y-3 pl-11">
                                    <p>Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will take steps to delete such information.</p>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Section 10 */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">10</div>
                                    <h2 className="text-xl font-bold text-gray-900">Changes to This Policy</h2>
                                </div>
                                <div className="text-gray-600 leading-relaxed space-y-3 pl-11">
                                    <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this page periodically for the latest information on our privacy practices.</p>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Contact Section */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-accent-100 text-accent-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Contact Us</h2>
                                </div>
                                <div className="text-gray-600 leading-relaxed pl-11">
                                    <p className="mb-4">If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm"><strong>Email:</strong> privacy@goholiday.com</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                            <span className="text-sm"><strong>Website:</strong> www.goholiday.com</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-8">
                        <Link
                            href={`/${lang}`}
                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
