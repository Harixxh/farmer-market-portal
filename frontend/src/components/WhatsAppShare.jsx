import { useLanguage } from '../context/LanguageContext';

// WhatsApp green color: #25D366
const WHATSAPP_BASE = 'https://wa.me/?text=';

/**
 * Generate a WhatsApp share URL
 */
const buildShareURL = (text) => {
  return WHATSAPP_BASE + encodeURIComponent(text);
};

/**
 * Share Produce Listing via WhatsApp
 */
export const shareProduceListing = (crop) => {
  const text = [
    `*${crop.name}* - Fresh from the farm!`,
    `Price: Rs.${crop.price}/${crop.unit}`,
    `Quantity: ${crop.quantity} ${crop.unit}`,
    crop.description ? `Details: ${crop.description}` : '',
    ``,
    `Listed on Farmer Market Intelligence Portal`,
  ].filter(Boolean).join('\n');
  window.open(buildShareURL(text), '_blank');
};

/**
 * Share Market Price via WhatsApp
 */
export const shareMarketPrice = (item) => {
  const text = [
    `*Market Price Update*`,
    `Commodity: ${item.commodity}`,
    `Market: ${item.market}, ${item.state}`,
    `Price: Rs.${item.modalPrice}/quintal`,
    `Min: Rs.${item.minPrice} | Max: Rs.${item.maxPrice}`,
    ``,
    `Source: Farmer Market Intelligence Portal`,
  ].join('\n');
  window.open(buildShareURL(text), '_blank');
};

/**
 * Share Order Details via WhatsApp
 */
export const shareOrderStatus = (order) => {
  const text = [
    `*Order Update*`,
    `Crop: ${order.produce?.name || 'N/A'}`,
    `Quantity: ${order.quantity} ${order.produce?.unit || ''}`,
    `Total: Rs.${order.totalPrice}`,
    `Status: ${order.status}`,
    ``,
    `Farmer Market Intelligence Portal`,
  ].join('\n');
  window.open(buildShareURL(text), '_blank');
};

/**
 * Inline WhatsApp share button
 */
const WhatsAppShareButton = ({ onClick, size = 'sm', label }) => {
  const { t } = useLanguage();
  const displayLabel = label || t('shareWhatsApp');

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center bg-[#25D366] hover:bg-[#1da851] text-white rounded-lg font-medium transition-colors ${sizeClasses[size]}`}
      title={displayLabel}
    >
      <svg className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span className="hidden sm:inline">{displayLabel}</span>
    </button>
  );
};

export default WhatsAppShareButton;
