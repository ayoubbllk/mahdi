const PRICE = 3200;
const WHATSAPP = ""; // مثال: "213555000000"
const PRODUCT_ID = "sovidio-cooker";
const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzZdObxY6pD7m7-RAr5NC4v9C00FjHztwiUq-Yos-kD_9CRBdLLMc4buKsXwpeQY9c/exec";

function sendToSheet(payload) {
  if (!SHEETS_WEBAPP_URL) {
    console.warn("Google Sheet غير مربوط: أضف SHEETS_WEBAPP_URL في js/main.js");
    return Promise.resolve();
  }
  return fetch(SHEETS_WEBAPP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }).catch((err) => console.warn("Sheet error", err));
}

function selectedColor() {
  const checked = form?.querySelector('input[name="color"]:checked');
  return checked ? checked.value : "أخضر";
}

function pixelData(extra = {}) {
  const qty = Number(qtyInput?.value) || 1;
  const color = selectedColor();
  return {
    content_ids: [PRODUCT_ID],
    content_name: `Sovidio ${color}`,
    content_type: "product",
    content_category: "Kitchen",
    currency: "DZD",
    value: currentTotal(),
    num_items: qty,
    contents: [{ id: PRODUCT_ID, quantity: qty, item_price: PRICE }],
    ...extra
  };
}

function track(event, extra) {
  if (typeof fbq !== "function") return;
  fbq("track", event, pixelData(extra));
}

const WILAYAS = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
  "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
  "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
  "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
  "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي",
  "خنشلة", "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت",
  "غرداية", "غليزان", "تيميمون", "برج باجي مختار", "أولاد جلال", "بني عباس",
  "عين صالح", "عين قزام", "تقرت", "جانت", "المغير", "المنيعة"
];

const formatPrice = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const qtyInput = document.getElementById("qtyInput");
const preview = document.getElementById("orderPreview");
const form = document.getElementById("orderForm");
const thanks = document.getElementById("thanks");
const thanksText = document.getElementById("thanksText");
const sticky = document.getElementById("stickyBuy");
const wilayaSelect = form.elements.wilaya;

WILAYAS.forEach((name) => {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  wilayaSelect.append(option);
});

function currentTotal() {
  const qty = Math.min(9, Math.max(1, Number(qtyInput.value) || 1));
  qtyInput.value = String(qty);
  return qty * PRICE;
}

function refreshTotals() {
  const total = formatPrice(currentTotal());
  document.getElementById("priceDisplay").textContent = formatPrice(PRICE);
  document.getElementById("summaryPrice").textContent = total;
  document.getElementById("submitPrice").textContent = total;
}

document.getElementById("qtyMinus").addEventListener("click", () => {
  qtyInput.value = String(Math.max(1, Number(qtyInput.value) - 1));
  refreshTotals();
});

document.getElementById("qtyPlus").addEventListener("click", () => {
  qtyInput.value = String(Math.min(9, Number(qtyInput.value) + 1));
  refreshTotals();
});

qtyInput.addEventListener("input", refreshTotals);

const COLOR_PREVIEW = {
  أخضر: { src: "images/hero_pot.png", bg: "#101816" },
  وردي: { src: "images/pink_pot.png", bg: "#f6f2eb" },
  أصفر: { src: "images/yellow_pot.png", bg: "#f6f2eb" }
};

function setPreview(color) {
  const choice = COLOR_PREVIEW[color] || COLOR_PREVIEW["أخضر"];
  preview.src = choice.src;
  preview.style.background = choice.bg;
}

Array.from(form.elements.color).forEach((radio) => {
  radio.addEventListener("change", () => {
    setPreview(radio.value);
    track("CustomizeProduct");
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form));
  const total = currentTotal();
  const summary = [
    "طلب جديد — سوفيديو",
    `الاسم: ${data.name}`,
    `الهاتف: ${data.phone}`,
    `الولاية: ${data.wilaya}`,
    `العنوان: ${data.address}`,
    `اللون: ${data.color}`,
    `الكمية: ${data.qty}`,
    `المجموع: ${formatPrice(total)} دج`,
    "هدية: لانش بوكس مجاني"
  ].join("\n");

  thanksText.textContent = `شكراً ${data.name}. طلبك (${formatPrice(total)} دج + لانش بوكس) من ولاية ${data.wilaya} سيتم تأكيده عبر الهاتف.`;
  thanks.hidden = false;
  track("Purchase", { value: total });
  sendToSheet({
    name: data.name,
    phone: data.phone,
    wilaya: data.wilaya,
    address: data.address,
    color: data.color,
    qty: data.qty,
    total,
    offer: "لانش بوكس مجاني"
  });

  if (WHATSAPP) {
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(summary)}`, "_blank", "noopener");
  }
});

document.getElementById("thanksClose").addEventListener("click", () => {
  thanks.hidden = true;
  form.reset();
  qtyInput.value = "1";
  setPreview("أخضر");
  refreshTotals();
});

thanks.addEventListener("click", (event) => {
  if (event.target === thanks) thanks.hidden = true;
});

const orderSection = document.getElementById("order");
const toggleSticky = () => {
  if (!sticky || window.innerWidth > 900) return;
  const rect = orderSection.getBoundingClientRect();
  const visible = rect.top < window.innerHeight && rect.bottom > 80;
  sticky.style.display = visible ? "none" : "flex";
};

window.addEventListener("scroll", toggleSticky, { passive: true });
window.addEventListener("resize", toggleSticky);
toggleSticky();
refreshTotals();

track("ViewContent");

let checkoutStarted = false;
const startCheckout = () => {
  if (checkoutStarted) return;
  checkoutStarted = true;
  track("InitiateCheckout");
};

form.addEventListener("focusin", startCheckout);

document.querySelectorAll('a[href="#order"]').forEach((link) => {
  link.addEventListener("click", () => {
    track("AddToCart");
    startCheckout();
  });
});

qtyInput.addEventListener("change", () => track("AddToCart"));
document.getElementById("qtyPlus").addEventListener("click", () => track("AddToCart"));
