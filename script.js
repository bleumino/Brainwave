const fileInput = document.getElementById('fileInput');
const processBtn = document.getElementById('processBtn');
const output = document.getElementById('output');

processBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) {
    output.textContent = "Please upload a file first!";
    return;
  }

  try {
    let text = "";
    if (file.type === "application/pdf") {
      text = await extractPDFText(file);
    } else {
      text = await file.text();
    }
    generateStudyMaterial(text);
  } catch (error) {
    localStorage.setItem('brainwaveText', '');
    output.innerHTML = `
      <h2>⚠️ Notice</h2>
      <p>Unable to read file as text. Raw content is saved.</p>
    `;
  }
});

async function extractPDFText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(i => i.str).join(" ") + "\n";
  }
  return text;
}

function generateStudyMaterial(text) {
  // Save the raw text in localStorage
  localStorage.setItem('brainwaveText', text);

  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
  const summary = sentences.slice(0, 3).join(". ") + ".";
  const question = sentences[0] ? "What is the main idea of: " + sentences[0].slice(0, 60) + "..." : "What did you learn?";

  output.innerHTML = `
    <h2>🧠 Summary</h2>
    <p>${summary}</p>
    <h2>🎯 Flashcard</h2>
    <p><strong>Q:</strong> ${question}</p>
    <p><strong>A:</strong> ${sentences[1] || "Think about the core idea."}</p>
    <h2>💡 Tip</h2>
    <p>Break your document into smaller chunks to review each section daily.</p>
  `;
}

try {
  let text = "";
  if (file.type === "application/pdf") {
    text = await extractPDFText(file);
  } else if (file.name.endsWith(".docx")) {
    // Read docx files using Mammoth
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    text = result.value;
  } else {
    text = await file.text();
  }
  generateStudyMaterial(text);
} catch (error) {
  localStorage.setItem('brainwaveText', '');
  output.innerHTML = `
    <h2>⚠️ Notice</h2>
    <p>Unable to read file as text. Raw content is saved.</p>
  `;
}

const flashcard = document.getElementById('flashcard');
const flipBtn = document.getElementById('flipBtn');

flipBtn.addEventListener('click', () => {
  flashcard.classList.toggle('flipped');
});


document.querySelectorAll('#quiz .option').forEach(btn => {
  btn.addEventListener('click', e => {
    if (e.target.textContent.includes("Idea 2")) {
      alert("Correct!");
    } else {
      alert("Try again!");
    }
  });
});

let currentChunk = 0;
let chunks = text.split(/\n\n/); // split by paragraphs

function showChunk(index) {
  output.innerHTML = `<p>${chunks[index]}</p>`;
}

// Load saved study material when page opens
window.addEventListener('load', () => {
  const savedText = localStorage.getItem('brainwaveText');
  if (savedText) {
    generateStudyMaterial(savedText);
  }
});

