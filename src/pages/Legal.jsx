import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import { CLUB_EMAIL, CLUB_PHONE, CLUB_LOCATION, mailto } from '../lib/contact';

const UPDATED = '9 October 2026';

const contactBlock = (
  <>
    <p>Babcock Investors Club, {CLUB_LOCATION}.</p>
    <ul>
      <li>Email: <a href={mailto('Privacy or terms question')}>{CLUB_EMAIL}</a></li>
      <li>Phone and WhatsApp: {CLUB_PHONE}</li>
    </ul>
  </>
);

const DOCS = {
  privacy: {
    title: 'Privacy Policy',
    seo: 'How the Babcock Investors Club collects, uses and protects your personal information, and your rights under Nigerian data protection law.',
    intro: 'What we collect when you use this website or join the club, why we collect it, and the choices you have.',
    sections: [
      { id: 'overview', title: 'Overview', body: (<>
        <p>This policy explains how the Babcock Investors Club (“BIC”, “we”, “us”) handles personal information when you use babcockinvestorsclub.com, apply for membership, register for an event, subscribe to updates or contact us (together, the “Services”).</p>
        <p>BIC is a student-led organisation at Babcock University. We follow the Nigeria Data Protection Act 2023 and only collect what we need to run the club.</p>
      </>) },
      { id: 'collect', title: 'Information we collect', body: (<>
        <p>Information you give us:</p>
        <ul>
          <li>Membership applications: your name, matric number, Babcock email, phone number, department, level, areas of interest, sector and committee choices.</li>
          <li>Event RSVPs: your name, email and the event you chose.</li>
          <li>Contact and partnership enquiries: your name, organisation, email, phone number and message.</li>
          <li>Updates: your email address, if you subscribe.</li>
          <li>Member accounts: your email address, a password (stored only in protected, scrambled form) and any profile details you add.</li>
        </ul>
        <p>Payments: membership fees are processed by Paystack. We receive a payment reference and confirmation. We never see or store your card details.</p>
        <p>Information collected automatically: basic technical details needed to deliver and secure the website, such as your browser type and the pages you visit.</p>
      </>) },
      { id: 'use', title: 'How we use your information', body: (<>
        <p>We use your information to:</p>
        <ul>
          <li>Process your membership application and manage your membership.</li>
          <li>Organise events and send you the details for events you registered for.</li>
          <li>Reply to your questions and partnership enquiries.</li>
          <li>Send club updates you asked for. You can unsubscribe at any time.</li>
          <li>Keep the website and your account secure.</li>
          <li>Meet our legal obligations.</li>
        </ul>
      </>) },
      { id: 'basis', title: 'Lawful basis', body: (<>
        <p>Under the Nigeria Data Protection Act 2023 we rely on your consent (for example, updates and RSVPs), on what is needed to provide your membership, on our legitimate interest in running the club, and on legal obligations where they apply. Where we rely on consent, you can withdraw it at any time.</p>
      </>) },
      { id: 'sharing', title: 'Who we share it with', body: (<>
        <p>We do not sell your personal information. We share it only with:</p>
        <ul>
          <li>Club executives who need it to run membership, events and partnerships.</li>
          <li>Service providers that host the website, store our records, send email and process payments. They act on our instructions and must keep your information safe.</li>
          <li>Sponsors and partners, only if you have clearly agreed first.</li>
          <li>Authorities, when the law requires it.</li>
        </ul>
      </>) },
      { id: 'transfers', title: 'Storage outside Nigeria', body: (<>
        <p>Some of our service providers store data on servers outside Nigeria. When that happens, we use providers that offer appropriate safeguards, as the Nigeria Data Protection Act requires.</p>
      </>) },
      { id: 'security', title: 'How we protect it', body: (<>
        <p>Information is encrypted in transit, and access to club records is limited to authorised executives. No system is perfectly secure, so if we ever learn of a breach that affects you, we will tell you and the regulator as the law requires.</p>
      </>) },
      { id: 'retention', title: 'How long we keep it', body: (<>
        <p>We keep personal information only as long as we need it for the purpose it was collected: membership records while you are a member and for a reasonable period afterwards so we can confirm past membership, and enquiries for as long as the conversation is active. After that we delete or anonymise it. You can ask us to delete your information sooner.</p>
      </>) },
      { id: 'rights', title: 'Your rights', body: (<>
        <p>You have the right to:</p>
        <ul>
          <li>Ask for a copy of the personal information we hold about you.</li>
          <li>Ask us to correct information that is wrong or incomplete.</li>
          <li>Ask us to delete your information.</li>
          <li>Object to, or ask us to limit, how we use it.</li>
          <li>Withdraw your consent and unsubscribe from updates at any time.</li>
          <li>Receive your information in a portable format.</li>
          <li>Complain to the Nigeria Data Protection Commission if you are unhappy with how we handled your information.</li>
        </ul>
        <p>To use any of these rights, email us at the address below. We reply within 72 hours and aim to resolve requests within 30 days.</p>
      </>) },
      { id: 'cookies', title: 'Cookies and storage', body: (<>
        <p>We use only essential browser storage: to keep you signed in to your member account and to remember basic preferences. We do not use advertising or cross-site tracking cookies.</p>
      </>) },
      { id: 'young', title: 'Younger students', body: (<>
        <p>The Services are meant for university students and organisations. If you are under 18, please ask a parent or guardian before you send us your details.</p>
      </>) },
      { id: 'changes', title: 'Changes to this policy', body: (<>
        <p>If we change this policy, we will update the date at the top of this page. For significant changes, we will also tell members by email.</p>
      </>) },
      { id: 'contact', title: 'Contact', body: contactBlock },
    ],
  },
  terms: {
    title: 'Terms of Use',
    seo: 'The terms that apply when you use the Babcock Investors Club website, join the club or attend its events.',
    intro: 'The rules that apply when you use this website, join the club or come to our events.',
    sections: [
      { id: 'acceptance', title: 'Accepting these terms', body: (<>
        <p>By using babcockinvestorsclub.com, applying for membership or registering for a BIC event, you agree to these terms. If you do not agree, please do not use the Services.</p>
      </>) },
      { id: 'about', title: 'About BIC', body: (<>
        <p>The Babcock Investors Club is a student-led organisation at Babcock University that teaches students how markets and investing work. It is run by student executives.</p>
      </>) },
      { id: 'education', title: 'Education, not financial advice', body: (<>
        <p>Everything on this website and at BIC sessions, including articles, workshops, competitions and resources, is for education only. It is not financial, investment, legal or tax advice, and nothing we say is a recommendation to buy or sell any asset.</p>
        <p>Investing involves risk, including losing money. Make your own decisions, and speak to a licensed professional before you invest.</p>
      </>) },
      { id: 'membership', title: 'Membership', body: (<>
        <ul>
          <li>Membership is open to registered Babcock University students.</li>
          <li>The membership fee is ₦2,500. It funds club sessions, resources and events.</li>
          <li>Membership benefits are provided at the club’s discretion and may change as the club grows.</li>
          <li>Refunds are at the discretion of the executive team.</li>
          <li>You agree to give accurate information when you apply.</li>
        </ul>
      </>) },
      { id: 'events', title: 'Events', body: (<>
        <ul>
          <li>Dates, venues and speakers may change. We will share updates on our socials and by email to people who registered.</li>
          <li>Please behave respectfully at every BIC event. We may ask anyone who disrupts an event to leave.</li>
          <li>We photograph our events and may use the photos on this website and our social media. If you would rather not appear, tell a club executive at the event or email us.</li>
          <li>Competition rules, such as for the stock pitch, are published separately and apply to entrants.</li>
        </ul>
      </>) },
      { id: 'payments', title: 'Payments', body: (<>
        <p>Online payments are processed by Paystack under its own terms. We never see or store your card details. Keep your payment reference, as you may need it to confirm your membership.</p>
      </>) },
      { id: 'accounts', title: 'Member accounts', body: (<>
        <p>Keep your password private and tell us straight away if you think someone else has used your account. We may suspend accounts that are misused or that break these terms.</p>
      </>) },
      { id: 'use', title: 'Using the website', body: (<>
        <p>You agree not to misuse the website, including by trying to access areas you are not allowed to, sending spam or false information through our forms, or interfering with how the site works.</p>
      </>) },
      { id: 'ip', title: 'Names, logos and content', body: (<>
        <p>The BIC name, logo and the content we create belong to the Babcock Investors Club. Articles we link to belong to their publishers. Sponsor and partner names and logos belong to those organisations.</p>
      </>) },
      { id: 'links', title: 'Other websites', body: (<>
        <p>This website links to other services, such as Paystack, WhatsApp, Instagram, LinkedIn and external articles. Their own terms and privacy policies apply when you use them.</p>
      </>) },
      { id: 'liability', title: 'Limitation of liability', body: (<>
        <p>We work hard to keep the website accurate and available, but we provide it as it is. To the extent the law allows, BIC is not responsible for losses that come from using the website, relying on its content, or taking part in club activities.</p>
      </>) },
      { id: 'changes', title: 'Changes to these terms', body: (<>
        <p>We may update these terms. The date at the top of this page shows when they last changed. Continuing to use the Services after a change means you accept the new terms.</p>
      </>) },
      { id: 'law', title: 'Governing law', body: (<>
        <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>
      </>) },
      { id: 'contact', title: 'Contact', body: contactBlock },
    ],
  },
};

export default function Legal({ doc = 'privacy' }) {
  const d = DOCS[doc] || DOCS.privacy;
  return (
    <>
      <Seo title={d.title} description={d.seo} />
      <PageHero crumb={d.title} title={d.title} description={d.intro}>
        <p className="legal-meta">Last updated {UPDATED}</p>
        <div className="legal-switch">
          <Link to="/privacy" className={`btn btn-sm ${doc === 'privacy' ? 'btn-primary' : 'btn-outline'}`} aria-current={doc === 'privacy' ? 'page' : undefined}>Privacy Policy</Link>
          <Link to="/terms" className={`btn btn-sm ${doc === 'terms' ? 'btn-primary' : 'btn-outline'}`} aria-current={doc === 'terms' ? 'page' : undefined}>Terms of Use</Link>
        </div>
      </PageHero>
      <section className="section">
        <div className="container legal">
          <nav className="legal-toc" aria-label="On this page">
            <p>On this page</p>
            {d.sections.map((s) => (
              <a key={s.id} href={`#${s.id}`}>{s.title}</a>
            ))}
          </nav>
          <div className="legal-body">
            {d.sections.map((s, i) => (
              <section key={s.id} id={s.id}>
                <h2><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</h2>
                {s.body}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
