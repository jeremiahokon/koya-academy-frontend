import { faqs } from '@/data/clinic';

export function Faq() {
  return (
    <section className="faq" aria-labelledby="faq-heading" id="faq">
      <h2 id="faq-heading">Questions</h2>
      <dl>
        {faqs.map((item) => (
          <div key={item.question} className="faq-item">
            <dt>{item.question}</dt>
            <dd>{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
