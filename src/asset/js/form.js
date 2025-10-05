// ======================
// form.js — versi bersih server-side
// ======================

// Ambil elemen input
const name = document.getElementById("name");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const description = document.getElementById("description");
const tech1 = document.getElementById("tech1");
const tech2 = document.getElementById("tech2");
const tech3 = document.getElementById("tech3");
const tech4 = document.getElementById("tech4");
const image = document.getElementById("image");
const addButton = document.getElementById("add");

// Optional: validasi sebelum submit ke server
addButton.addEventListener("click", (e) => {
  if (!name.value.trim()) {
    e.preventDefault();
    alert("Nama project harus diisi!");
  } else if (!startDate.value || !endDate.value) {
    e.preventDefault();
    alert("Tanggal mulai dan tanggal akhir harus diisi!");
  }
});

// Fungsi tambahan (optional) untuk menghitung durasi
function countDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) return "Tanggal tidak valid";
  if (end < start) return "Tanggal akhir harus setelah tanggal mulai";

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} tahun`);
  if (months > 0) parts.push(`${months} bulan`);
  if (days > 0) parts.push(`${days} hari`);
  return parts.join(" ") || "0 hari";
}
