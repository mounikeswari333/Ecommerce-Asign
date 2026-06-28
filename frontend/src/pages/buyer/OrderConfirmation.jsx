import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, MapPin, Truck } from 'lucide-react';

export default function OrderConfirmation() {
  const { id } = useParams();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--yellow-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card" style={{ background: '#fff', maxWidth: 500, width: '100%', padding: 40, borderRadius: 16, border: '1px solid var(--gray-200)', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', color: '#2E7D32' }}>
          <CheckCircle2 size={64} />
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginTop: 20, color: 'var(--gray-900)' }}>
          Order Confirmed!
        </h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 8 }}>
          Thank you for shopping with PashuSevak! Your order has been placed and is being processed by the seller.
        </p>

        {/* Order Details box */}
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 16, margin: '24px 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--gray-500)' }}>Order ID:</span>
            <strong className="mono" style={{ color: 'var(--gray-900)' }}>{id}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--gray-500)' }}>Delivery SLA:</span>
            <strong style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-900)' }}>
              <Calendar size={14} /> 2-4 Business Days
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--gray-500)' }}>Shipping Mode:</span>
            <strong style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-900)' }}>
              <Truck size={14} /> Easy Ship (Delhivery/BlueDart)
            </strong>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link to={`/track-order/${id}`} className="btn btn-primary" style={{ padding: 12, fontWeight: 700, fontSize: 14 }}>
            Track Your Order
          </Link>
          <Link to="/" className="btn btn-outline" style={{ padding: 12, fontWeight: 600, fontSize: 13 }}>
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
