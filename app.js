
const plants = {
  P01: {growth:'upright', broad:true,  whorled:false, spiny:false, flower:true},
  P02: {growth:'upright', broad:true,  whorled:false, spiny:true,  flower:false},
  P03: {growth:'upright', broad:false, whorled:false, spiny:true,  flower:true},
  P04: {growth:'upright', broad:true,  whorled:true,  spiny:false, flower:false},
  P05: {growth:'spire',   broad:false, whorled:false, spiny:false, flower:false},
  P06: {growth:'spire',   broad:false, whorled:true,  spiny:true,  flower:true},
  P07: {growth:'spire',   broad:true,  whorled:false, spiny:false, flower:false},
  P08: {growth:'creeping',broad:true,  whorled:false, spiny:true,  flower:true},
  P09: {growth:'creeping',broad:false, whorled:true,  spiny:false, flower:true},
  P10: {growth:'creeping',broad:false, whorled:false, spiny:true,  flower:false}
};



const a0Ids = ['P01', 'P02', 'P05', 'P06', 'P08', 'P09'];
const a1Ids = Object.keys(plants);


const investigation = sessionStorage.getItem('alien-selected-investigation') === 'a1' ? 'a1' : 'a0';
const ids = investigation === 'a1' ? a1Ids : a0Ids;
const storageKey = investigation === 'a1' ? 'alien-a1-v1' : 'alien-a0-v1';


const questions=[['creeping','Does the plant grow along the ground?',p=>p.growth==='creeping'],['spire','Does the plant have a spiraling stem?',p=>p.growth==='spire'],['broad','Does the plant have broad leaves?',p=>p.broad],['whorled','Are the leaves arranged in whorls?',p=>p.whorled],['spiny','Does the stem have spines?',p=>p.spiny],['flower','Does the plant produce flowers?',p=>p.flower]];

const initial=()=>({researcherName:'',nodes:{root:{id:'root',plants:ids,q:'',assign:{},children:null}},names:{upright:'',spire:'',creeping:''},epithets:{},active:'root',tab:'classify',feedback:''});


let state;try{state=JSON.parse(localStorage.getItem(storageKey))||initial();if(!state.nodes?.root)state=initial()}catch{state=initial()};
const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}};

/* ========================================
   XENOZOOLOGY — SAVED IDENTIFICATIONS
   ======================================== */

// Preserve existing identifications when research is resumed.
// Older research records will start with an empty collection.
if (
  !state.identifiedAnimals ||
  typeof state.identifiedAnimals !== "object" ||
  Array.isArray(state.identifiedAnimals)
) {
  state.identifiedAnimals = {};
}

save();

/* Transfer a new researcher's name into the selected investigation */
const pendingResearcherName = sessionStorage.getItem(
  "alien-pending-researcher-name"
);

if (pendingResearcherName !== null) {
  state.researcherName = pendingResearcherName;
  save();
  sessionStorage.removeItem("alien-pending-researcher-name");
}

/* Detect meaningful saved research for either investigation */
function hasSavedInvestigation(key) {
  let savedState;

  try {
    savedState = JSON.parse(localStorage.getItem(key));
  } catch {
    return false;
  }

  if (!savedState || !savedState.nodes?.root) {
    return false;
  }

  const hasClassificationWork =
    Object.keys(savedState.nodes).length > 1 ||
    Boolean(savedState.nodes.root.q);

  const hasScientificNames =
    Object.values(savedState.names || {}).some(
      name => String(name).trim() !== ""
    ) ||
    Object.values(savedState.epithets || {}).some(
      name => String(name).trim() !== ""
    );

  return hasClassificationWork || hasScientificNames;
}


/* Save researcher identification from the Research Archive */
function saveArchiveResearcher(choice) {
  const key = choice === "a1" ? "alien-a1-v1" : "alien-a0-v1";
  const inputId = choice === "a1"
    ? "a1ResearcherInput"
    : "a0ResearcherInput";

  const input = document.getElementById(inputId);
  if (!input) return;

  const name = input.value.trim();

  // An empty field leaves the existing researcher name unchanged.
  if (!name) return;

  let savedResearch;

  try {
    savedResearch = JSON.parse(localStorage.getItem(key));
  } catch {
    savedResearch = null;
  }

  // Never replace an existing research record with an incomplete one.
  if (!savedResearch || !savedResearch.nodes?.root) return;

  savedResearch.researcherName = name;
  localStorage.setItem(key, JSON.stringify(savedResearch));
}


/* Open a selected investigation or show saved research */
document.addEventListener("DOMContentLoaded", function () {
  const resumeScreen = document.getElementById("resumeScreen");
  const welcomeScreen = document.getElementById("welcomeScreen");

  // Check each investigation's saved research independently.
  const a0Saved = hasSavedInvestigation("alien-a0-v1");
  const a1Saved = hasSavedInvestigation("alien-a1-v1");

  // Update the Research Archive status indicators.
  const a0Status = document.getElementById("a0ArchiveStatus");
  const a1Status = document.getElementById("a1ArchiveStatus");
  const resumeA0 = document.getElementById("resumeA0");
  const resumeA1 = document.getElementById("resumeA1");

  // Display the researcher associated with each saved investigation.
  function displayArchiveResearcher(key, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let savedResearch;

    try {
      savedResearch = JSON.parse(localStorage.getItem(key));
    } catch {
      savedResearch = null;
    }

    const name = typeof savedResearch?.researcherName === "string"
      ? savedResearch.researcherName.trim()
      : "";

    if (name && hasSavedInvestigation(key)) {
      element.textContent = "● RESEARCHER — " + name;
      element.hidden = false;
      element.style.display = "block";
    } else {
      element.textContent = "";
      element.hidden = true;
      element.style.display = "none";
    }
  }

  displayArchiveResearcher("alien-a0-v1", "a0ArchiveResearcher");
  displayArchiveResearcher("alien-a1-v1", "a1ArchiveResearcher");


  if (a0Status) {
    a0Status.textContent = a0Saved
      ? "● DATA DETECTED — RESEARCH AVAILABLE"
      : "○ NO DATA DETECTED";
  }

  if (a1Status) {
    a1Status.textContent = a1Saved
      ? "● DATA DETECTED — RESEARCH AVAILABLE"
      : "○ NO DATA DETECTED";
  }

  // Only display Resume when meaningful research exists.
  if (resumeA0) {
    resumeA0.hidden = !a0Saved;
    resumeA0.style.display = a0Saved ? "" : "none";
  }

  if (resumeA1) {
    resumeA1.hidden = !a1Saved;
    resumeA1.style.display = a1Saved ? "" : "none";
  }

  // A student just selected A0 or A1.
  // Open the workstation without replaying the introduction.
  if (sessionStorage.getItem("alien-launch-selected") === "true") {
    sessionStorage.removeItem("alien-launch-selected");

    document.querySelectorAll(".welcome-screen").forEach(function (screen) {
      screen.style.display = "none";
    });

    if (resumeScreen) {
      resumeScreen.hidden = true;
    }

// Resume Xenozoology if the student has already unlocked it.
if (state.zoologyUnlocked === true) {

  const animalWorkstation = document.getElementById("animalWorkstation");

  if (animalWorkstation) {

    // Hide the botanical workstation.
    document.querySelector(".shell").style.display = "none";
    document.querySelector("header.top").style.display = "none";

    // Restore the animal workstation.
    animalWorkstation.hidden = false;
    animalWorkstation.style.display = "block";
  }
}

    return;
  }

  // A new investigation was deliberately started.
  // Allow the welcome animation to play, even if the
  // other investigation still has saved research.
  if (sessionStorage.getItem("alien-start-fresh") === "true") {
    sessionStorage.removeItem("alien-start-fresh");
    return;
  }


  // Show the Research Archive if either investigation has saved work.
  if (resumeScreen && welcomeScreen && (a0Saved || a1Saved)) {
    welcomeScreen.style.display = "none";
    resumeScreen.hidden = false;
  }
});



/* Resume either saved investigation from the Research Archive */
document.addEventListener("DOMContentLoaded", function () {
  const resumeA0 = document.getElementById("resumeA0");
  const resumeA1 = document.getElementById("resumeA1");

  function resumeResearch(choice) {
    sessionStorage.setItem("alien-selected-investigation", choice);
    sessionStorage.setItem("alien-launch-selected", "true");
    window.location.reload();
  }


if (resumeA0) {
  resumeA0.addEventListener("click", function () {
    saveArchiveResearcher("a0");
    resumeResearch("a0");
  });
}


if (resumeA1) {
  resumeA1.addEventListener("click", function () {
    saveArchiveResearcher("a1");
    resumeResearch("a1");
  });
}

});

/* Start a new A0 or A1 investigation independently */
document.addEventListener("DOMContentLoaded", function () {
  const newA0 = document.getElementById("newA0");
  const newA1 = document.getElementById("newA1");

  function startNewResearch(choice) {
    const key = choice === "a1" ? "alien-a1-v1" : "alien-a0-v1";
    const label = choice.toUpperCase();

    // Warn only when this investigation has saved research.
    if (hasSavedInvestigation(key)) {
      const confirmed = window.confirm(
        "Start a new " + label + " investigation?\n\n" +
        "This will permanently erase your saved classifications " +
        "and scientific names for " + label + " on this device.\n\n" +
        "Your other investigation will not be affected.\n\n" +
        "Select OK to start over, or Cancel to keep your research."
      );

      if (!confirmed) return;
    }

    
    // Capture the new researcher's name before clearing old research.
    const researcherInput = document.getElementById(
      choice === "a1" ? "a1ResearcherInput" : "a0ResearcherInput"
    );

    const newResearcherName = researcherInput
      ? researcherInput.value.trim()
      : "";

    // Clear only the selected investigation.
    localStorage.removeItem(key);

    // Carry the new researcher's name into the fresh investigation.
    if (newResearcherName) {
      sessionStorage.setItem(
        "alien-pending-researcher-name",
        newResearcherName
      );
    } else {
      sessionStorage.removeItem("alien-pending-researcher-name");
    }


    
    
    
    // Remember the selected investigation and restart the introduction.
    sessionStorage.setItem("alien-selected-investigation", choice);
    sessionStorage.removeItem("alien-launch-selected");
    sessionStorage.setItem("alien-start-fresh", "true");
    sessionStorage.setItem("alien-intro-choice", choice);
    window.location.reload();



  }

  if (newA0) {
    newA0.addEventListener("click", function () {
      startNewResearch("a0");
    });
  }

  if (newA1) {
    newA1.addEventListener("click", function () {
      startNewResearch("a1");
    });
  }
});



const el=id=>document.getElementById(id);const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const pic=id=>`assets/${id}.png`;const node=id=>state.nodes[id];const complete=()=>ids.filter(id=>Object.values(state.nodes).some(n=>n.plants.length===1&&n.plants[0]===id)).length;const leafNodes=()=>Object.values(state.nodes).filter(n=>n.plants.length===1);const qById=id=>questions.find(q=>q[0]===id);
/* Determine whether the botanical dichotomous key is complete */
function botanicalKeyComplete() {
  return complete() === ids.length &&
    Object.values(state.nodes).every(
      branch => branch.plants.length === 1 || branch.children
    );
}
function descendants(id){let n=node(id);if(!n?.children)return [];return [...n.children,...n.children.flatMap(descendants)]}function branchTitle(n){if(n.id==='root')return 'All specimens';const side=n.id.endsWith('-y')?'Yes':'No';const parent=node(n.id.slice(0,-2));return `${side} · ${parent?.q?qById(parent.q)[1]:'Classification branch'}`}
function render(){
el('count').textContent=`${complete()} / ${ids.length}`;
/* Update the animal investigation button */
const animalButton = document.getElementById('beginAnimalInvestigation');

if (animalButton) {
  const unlocked = botanicalKeyComplete();

  animalButton.disabled = !unlocked;
  animalButton.classList.toggle('unlocked', unlocked);

  animalButton.textContent = unlocked
    ? 'BEGIN ANIMAL INVESTIGATION →'
    : '🔒 ANIMAL INVESTIGATION — LOCKED';
}

document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));const branches=Object.values(state.nodes).filter(n=>n.plants.length>1);
/* Find the next unresolved branch to highlight */

/* Highlight the next unresolved branch
   only when the current branch is complete. */

const currentBranch = node(state.active);

const nextBranch = currentBranch?.children
  ? branches.find(n => !n.children && n.id !== state.active)
  : null;

el('branchList').innerHTML=branches.map((n,i)=>`<button 
class="branch ${state.active===n.id?'active':''} ${nextBranch?.id===n.id?'next-branch':''}"
 data-branch="${escapeHtml(n.id)}"><span class="status">${n.children?'✓':'○'}</span><b>Branch ${i+1}</b><small>${n.plants.length} specimens · ${n.children?'Sorted':'Unresolved'}</small></button>`).join('')||'<p>All plants have been isolated! Visit the research notebook.</p>';el('main').innerHTML=state.tab==='gallery'?gallery():state.tab==='notebook'?notebook():classify();save()}

function classify() {
  let n = node(state.active);

  if (!n || n.plants.length === 1) {
    state.active = 'root';
    n = node('root');
  }

  const cards = n.plants.map(id => `
    <article class="specimen">
      <img src="${pic(id)}"
           alt="Alien plant ${id}, click to enlarge"
           data-inspect="${id}" tabindex="0">
      <div class="name">${displayName(id)}</div>
      <div class="choices">
        <button class="yes ${n.assign[id] === 'yes' ? 'selected' : ''}"
                data-sort="${id}:yes"
                aria-pressed="${n.assign[id] === 'yes'}">YES</button>
        <button class="no ${n.assign[id] === 'no' ? 'selected' : ''}"
                data-sort="${id}:no"
                aria-pressed="${n.assign[id] === 'no'}">NO</button>
      </div>
    </article>
  `).join('');

  const yes = n.plants.filter(id => n.assign[id] === 'yes');
  const no = n.plants.filter(id => n.assign[id] === 'no');

  return `
    <div class="mainhead">
      <h1>Classification workstation</h1>
      <span class="pill">${n.plants.length} specimens in branch</span>
    </div>

    <div class="questionbox">
      <label for="question">SELECT AN ANATOMICAL QUESTION</label>
      <select id="question">
        <option value="">Choose a characteristic…</option>
        ${questions.map(q => `
          <option value="${q[0]}" ${n.q === q[0] ? 'selected' : ''}>
            ${q[1]}
          </option>
        `).join('')}
      </select>
    </div>

    <p class="hint">
      Inspect a plant to enlarge it. Then choose YES or NO
      for each specimen. You make every sorting decision.
    </p>

    <div class="cards">${cards}</div>

    <div class="zones">
      <div class="zone">
        <strong>YES — ${yes.length} specimen${yes.length === 1 ? '' : 's'}</strong>
        ${yes.map(id => `<span>${displayName(id)}</span>`).join('')
          || 'No specimens assigned yet'}
      </div>

      <div class="zone no">
        <strong>NO — ${no.length} specimen${no.length === 1 ? '' : 's'}</strong>
        ${no.map(id => `<span>${displayName(id)}</span>`).join('')
          || 'No specimens assigned yet'}
      </div>
    </div>

    <div class="actions">
      <button class="primary" id="check">Check classification</button>
      
<button class="secondary" id="showKey">
  ${Object.values(state.nodes).every(
    branch => branch.plants.length === 1 || branch.children
  ) ? 'View completed key' : 'View developing key'}
</button>

    </div>

    ${state.feedback ? `
      <div class="feedback ${state.feedback.startsWith('Confirmed') ? 'good' : 'bad'}">
        ${escapeHtml(state.feedback)}
      </div>
    ` : ''}
  `;
}
function gallery(){return `<div class="mainhead"><h1>Specimen gallery</h1><span class="pill">A0 · 6 species</span></div><p class="hint">Inspect each specimen. You can name the three growth-form groups in the research notebook.</p><div class="gallery">${ids.map(id=>`<article class="specimen"><img src="${pic(id)}" data-inspect="${id}" alt="Inspect ${id}" tabindex="0">
<div class="name">${displayName(id)}</div>
<button class="secondary" data-inspect="${id}">Enlarge specimen</button></article>`).join('')}</div>`}

/* ========================================
   SCIENTIFIC NAMING
   ======================================== */
/* Expedition reference names — used only to fill unnamed fields */
const referenceGenera = {
  upright: "Procerus",
  spire: "Spiralis",
  creeping: "Repensus"
};

const referenceEpithets = {
  P01: "latifolius",
  P02: "spinaconus",
  P03: "floseximius",
  P04: "circulus",
  P05: "bellaria",
  P06: "ignis",
  P07: "vestigium",
  P08: "virgodentata",
  P09: "sphaera",
  P10: "festivus"
};

/* Check whether every plant has a complete scientific name */
function botanicalNamesComplete() {
  return ids.every(id => {
    const group = plants[id].growth;

    const genus = String(state.names[group] || "").trim();
    const epithet = String(state.epithets[id] || "").trim();

    return genus !== "" && epithet !== "";
  });
}

/* Fill unnamed fields with expedition reference names */
function adoptReferenceNames() {
  // Preserve every genus name the researcher has already created.
  for (const group of Object.keys(referenceGenera)) {
    if (!String(state.names[group] || "").trim()) {
      state.names[group] = referenceGenera[group];
    }
  }
  // Track any reference names that cannot be assigned.
  const namingConflicts = [];
  // Preserve every species epithet the researcher has already created.
  // Only apply names to plants included in the current investigation.
    for (const id of ids) {
    // Never replace an epithet the student has already created.
    if (String(state.epithets[id] || "").trim()) continue;

    const group = plants[id].growth;
    const proposedEpithet = referenceEpithets[id];

    // Check for an existing identical epithet within this genus.
    const alreadyUsed = ids.some(other =>
      other !== id &&
      plants[other].growth === group &&
      String(state.epithets[other] || "").trim().toLowerCase() ===
        proposedEpithet.toLowerCase()
    );

    // Leave the field blank rather than create a duplicate.
        if (!alreadyUsed) {
      state.epithets[id] = proposedEpithet;
    } else {
      namingConflicts.push(id);
    }
  }

  save();
  if (namingConflicts.length > 0) {
    alert(
      "Expedition reference names have been applied where possible.\n\n" +
      "The following specimens still need species names: " +
      namingConflicts.join(", ") + ".\n\n" +
      "Their reference epithets were already used by another species " +
      "in the same genus. Please name these specimens yourself."
    );
  }
}

function scientific(id) {
  const group = plants[id].growth;

  // Retrieve the genus and species epithet.
  const genus = state.names[group];
  const epithet = state.epithets[id];

  // Both are required for a complete scientific name.
  if (!genus || !epithet) {
    return 'Not yet named';
  }

  // Format as a binomial scientific name.
  return `<i>${escapeHtml(genus)} ${escapeHtml(epithet)}</i>`;
}

function displayName(id) {
  const name = scientific(id);

  if (name === 'Not yet named') {
    return escapeHtml(id);
  }

  return name;
}
/* ========================================
   FIELD GUIDE — BOTANICAL SCIENTIFIC NAMES
   ======================================== */

function fieldGuidePlantName(id) {

  const group = plants[id].growth;

  // Prioritize the student's chosen genus.
  const genus =
    String(state.names[group] || "").trim() ||
    referenceGenera[group];

  // Prioritize the student's chosen species epithet.
  const epithet =
    String(state.epithets[id] || "").trim() ||
    referenceEpithets[id];

  // Return the complete scientific name.
  return genus + " " + epithet;
}
function notebook(){return `<div class="mainhead"><h1>Scientific Naming</h1><span class="pill">${complete()} / ${ids.length} isolated</span></div><div class="info"><b>Scientific naming</b><br>Choose a genus-style name for each predefined growth-form group. When a specimen is isolated, assign it a descriptive species epithet. Names are fictional classifications for this investigation; shared growth form alone does not establish evolutionary ancestry.</div><h3>Growth-form group names</h3><div class="fields">${['upright','spire','creeping'].map(g=>`<label>${g[0].toUpperCase()+g.slice(1)} group<input data-genus="${g}" value="${escapeHtml(state.names[g])}" placeholder="Invent a genus name" maxlength="25"></label>`).join('')}</div><h3>Isolated specimens</h3>${ids.map(id=>{const isolated=leafNodes().some(n=>n.plants[0]===id);return `<div class="info" style="margin:7px 0;display:flex;gap:12px;align-items:center;justify-content:space-between"><span><b>${id}</b> · ${isolated?scientific(id):'Not isolated yet'}</span>${isolated?`<button class="secondary" data-name="${id}">Name species</button>`:'<small>Continue classification</small>'}</div>`}).join('')}
<div class="info">
  <b>Need help with scientific names?</b><br>
  If you prefer not to create your own names, you may adopt the expedition's
  reference names for any unnamed genera or species. Names you have already
  created will be preserved.
  <div style="margin-top:12px">
    <button class="secondary" id="adoptReferenceNames">
      Adopt expedition reference names
    </button>
  </div>
</div>
<div class="actions"><button class="secondary" id="showKey">View branching key</button></div>
<p class="footerline">Prototype note: the research record exports as a printable HTML file. Portable Day 2 save/import and PDF export will be developed later.</p>`}

/* ========================================
   TRADITIONAL DICHOTOMOUS KEY
   ======================================== */

function renderTree(id) {
  const couplets = [];
  const numbers = {};
  let nextNumber = 1;

  // Assign a number to each question in the key.
  function numberBranches(branchId) {
    const branch = node(branchId);

    if (!branch || branch.plants.length === 1) {
      return;
    }

    numbers[branchId] = nextNumber++;

    if (branch.children) {
      numberBranches(branch.children[0]);
      numberBranches(branch.children[1]);
    }
  }

  numberBranches(id);

  // Determine where each answer leads.
  function destination(branchId) {
    const branch = node(branchId);

    if (!branch) {
      return 'Classification incomplete';
    }

    if (branch.plants.length === 1) {
      return displayName(branch.plants[0]);
    }

    return `Go to ${numbers[branchId]}`;
  }

  // Convert a question into two paired statements.
  function makeCouplets(branchId) {
    const branch = node(branchId);

    if (!branch || branch.plants.length === 1) {
      return;
    }

    const question = qById(branch.q);
    const number = numbers[branchId];

    let yesDestination = 'Classification incomplete';
    let noDestination = 'Classification incomplete';

    if (branch.children) {
      yesDestination = destination(branch.children[0]);
      noDestination = destination(branch.children[1]);
    }

    const questionText = question
      ? question[1]
      : 'Question not yet selected';

    
    couplets.push(`
      <div class="key-couplet"
           style="margin-bottom: 24px;">

        <!-- Number and question -->
        <div class="key-question"
             style="margin-bottom: 8px;">

          <strong>${number}. ${escapeHtml(questionText)}</strong>

        </div>

        <!-- YES and NO choices -->
        <div class="key-pair"
             style="padding-left: 28px;">

          <div class="key-choice"
               style="margin-bottom: 5px;">

            <span class="key-statement">
              <b>a.</b> YES —
            </span>

            <span class="key-destination">
              ${yesDestination}
            </span>

          </div>

          <div class="key-choice">

            <span class="key-statement">
              <b>b.</b> NO —
            </span>

            <span class="key-destination">
              ${noDestination}
            </span>

          </div>

        </div>
      </div>
    `);

    if (branch.children) {
      makeCouplets(branch.children[0]);
      makeCouplets(branch.children[1]);
    }
  }

  makeCouplets(id);

  return `
    <div class="traditional-key">
      ${couplets.join('')}
    </div>
  `;
}
function modal(html){el('modalContent').innerHTML=html;el('modal').classList.remove('hidden')};function closeModal(){el('modal').classList.add('hidden')};
/* ========================================
   SPECIMEN INSPECTION WINDOW
   ======================================== */

function inspect(id) {
  modal(`
    <h2>Specimen: ${displayName(id)}</h2>

    <img
      class="inspectimg"
      src="${pic(id)}"
      alt="Enlarged alien plant ${id}"
    >

    <p class="hint">
      Observe the plant's structure.
      Anatomical answers are intentionally not labeled.
    </p>
  `);
}

function validate(){const n=node(state.active);if(!n.q){state.feedback='Choose an anatomical question before sorting.';return render()}const q=qById(n.q),correctYes=n.plants.filter(id=>q[2](plants[id])),correctNo=n.plants.filter(id=>!q[2](plants[id]));if(!correctYes.length||!correctNo.length){state.feedback='This characteristic does not distinguish the specimens in this group. Select another question.';return render()}if(n.plants.some(id=>!n.assign[id])){state.feedback=`Assign all ${n.plants.length} specimens to Yes or No before checking.`;return render()}const wrong=n.plants.filter(id=>(n.assign[id]==='yes')!==q[2](plants[id]));if(wrong.length){state.feedback=`${wrong.length} specimen${wrong.length===1?' is':'s are'} incorrectly classified. Reexamine the selected characteristic and try again.`;return render()}if(!n.children){const y=`${n.id}-y`,no=`${n.id}-n`;n.children=[y,no];state.nodes[y]={id:y,plants:correctYes,q:'',assign:{},children:null};state.nodes[no]={id:no,plants:correctNo,q:'',assign:{},children:null}}
const keyComplete = Object.values(state.nodes).every(
  n => n.plants.length === 1 || n.children
);

state.feedback = keyComplete
  ? 'Your dichotomous key is complete. Click the Scientific Naming tab to name the alien plant specimens.'
  : 'Confirmed! Your dichotomous key has been updated. Choose another unresolved branch to continue.';
render()}
function changeQuestion(q){const n=node(state.active);if(n.children){if(!confirm('Changing this question will rebuild its descendant branches. Other branches will be preserved. Continue?')){render();return}for(const id of descendants(n.id))delete state.nodes[id];n.children=null}n.q=q;n.assign={};state.feedback='';render()}

function nameSpecies(id) {
  const group = plants[id].growth;

  modal(`
    <h2>Name specimen ${id}</h2>

    <div style="text-align:center; margin:15px 0;">
      <img
        src="${pic(id)}"
        alt="Alien plant specimen ${id}"
        style="
          width:100%;
          max-width:240px;
          max-height:260px;
          object-fit:contain;
          border-radius:12px;
          background:#eef5fa;
          padding:12px;
          box-sizing:border-box;
        "
      >
    </div>

    <p>Growth-form group: <b>${group}</b></p>

    <p>
      Genus:
      <b>${escapeHtml(state.names[group] || '(set this in the notebook first)')}</b>
    </p>

    <label>
      Species epithet (lowercase)
      <input
        id="epithetInput"
        maxlength="25"
        value="${escapeHtml(state.epithets[id] || '')}"
        placeholder="e.g., aurora"
        style="display:block;width:100%;padding:10px;margin:9px 0"
      >
    </label>

    <p class="hint">
      Use a descriptive, Latinized word if you like.
      The simulation formats the scientific name.
    </p>

    <button class="primary" id="saveEpithet" data-id="${id}">
      Save name
    </button>
  `);
}

function exportRecord(){const html=`<!doctype html><html><head><meta charset="utf-8"><title>Alien Explorer A0 Research Record</title><style>body{font:15px Arial;margin:30px;color:#18314b}h1{color:#006a9b}.node{border-left:2px solid #8bbde0;padding:8px 15px;margin:10px}</style></head><body><h1>Alien Explorer — A0 Research Record</h1><h2>Growth-form names</h2>${Object.entries(state.names).map(([k,v])=>`<p>${k}: ${escapeHtml(v||'Not named')}</p>`).join('')}<h2>Specimen names</h2>${ids.map(id=>`<p>${id}: ${scientific(id)}</p>`).join('')}<h2>Constructed dichotomous key</h2>${renderTree('root')}<p>Print this page or save it as a PDF from your browser.</p></body></html>`;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download='Alien_Explorer_A0_Research_Record.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
document.addEventListener('click',e=>{const t=e.target.closest('button,[data-inspect]');if(!t)return;if(t.dataset.tab){state.tab=t.dataset.tab;state.feedback='';render()}else if(t.dataset.branch){state.active=t.dataset.branch;state.tab='classify';state.feedback='';render()}else if(t.dataset.inspect)inspect(t.dataset.inspect);else if(t.dataset.sort){const [id,v]=t.dataset.sort.split(':');const n=node(state.active);if(n.children){if(!confirm('Editing this completed split will rebuild its descendant branches. Continue?'))return;for(const d of descendants(n.id))delete state.nodes[d];n.children=null}n.assign[id]=v;state.feedback='';render()}else if(t.id==='check')validate();else if(t.id==='showKey')modal(`<h2>Your developing dichotomous key</h2>${renderTree('root')}`);
else if(t.id==='adoptReferenceNames'){
  const confirmed=confirm(
    "Adopt the expedition's reference scientific names?\n\n" +
    "Only blank genus names and species epithets will be filled in. " +
    "Every name you have already created will be preserved.\n\n" +
    "Select OK to adopt the reference names, or Cancel to return to your research."
  );
  if(!confirmed)return;
  adoptReferenceNames();
  render();
}
else if(t.id==='openChildren'){const n=node(state.active);state.active=n.children.find(id=>node(id).plants.length>1)||n.children[0];state.feedback='';render()}else if(t.id==='closeModal')closeModal();else if(t.dataset.name)nameSpecies(t.dataset.name);else if(t.id==='saveEpithet'){const id=t.dataset.id,v=el('epithetInput').value.trim().toLowerCase().replace(/[^a-z-]/g,'');if(!v){alert('Enter a species epithet using letters.');return}const group=plants[id].growth;if(ids.some(other=>other!==id&&plants[other].growth===group&&state.epithets[other]===v)){alert('Another species in this genus already has that epithet.');return}state.epithets[id]=v;closeModal();render()}else if(t.id==='export')exportRecord();else if(t.id==='reset'){if(confirm('Erase this local A0 investigation and start again?')){state=initial();render()}}});
document.addEventListener('change',e=>{if(e.target.id==='question')changeQuestion(e.target.value);if(e.target.dataset.genus){const g=e.target.dataset.genus;state.names[g]=e.target.value.trim().replace(/[^a-zA-Z-]/g,'').replace(/^./,c=>c.toUpperCase());render()}});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.key==='Enter'&&e.target.matches('img[data-inspect]'))inspect(e.target.dataset.inspect)});el('modal').addEventListener('click',e=>{if(e.target===el('modal'))closeModal()});render();

/* ========================================
   ALIEN EXPLORER — WELCOME SCREEN
   ======================================== */


document.addEventListener("DOMContentLoaded", function () {
  const beginButton = document.getElementById("beginExpedition");
  const welcomeScreen = document.getElementById("welcomeScreen");
  const transmissionScreen = document.getElementById("transmissionScreen");

  if (beginButton && welcomeScreen && transmissionScreen) {
    beginButton.addEventListener("click", function () {
      welcomeScreen.style.display = "none";
      transmissionScreen.hidden = false;
    });
  }
});


/* Skip the cinematic introduction without resetting student progress */

document.addEventListener("DOMContentLoaded", function () {
  const skipButtons = document.querySelectorAll(".intro-skip");
  const selectionScreen = document.getElementById("investigationSelectScreen");

  skipButtons.forEach(function (button) {
    button.addEventListener("click", function () {

      const priorChoice = sessionStorage.getItem("alien-intro-choice");

      // Hide all cinematic introduction screens.
      document.querySelectorAll(".welcome-screen").forEach(function (screen) {
        screen.style.display = "none";
      });

      if (priorChoice === "a0" || priorChoice === "a1") {
        // The student already selected an investigation.
        // Open the appropriate workstation directly.
        sessionStorage.removeItem("alien-intro-choice");

        if (selectionScreen) {
          selectionScreen.hidden = true;
          selectionScreen.style.display = "none";
        }

      } else {
        // No investigation has been selected yet.
        // Require the student to choose A0 or A1.
        if (selectionScreen) {
          selectionScreen.hidden = false;
          selectionScreen.style.display = "flex";
        }
      }

    });
  });
});




/* Scene 2 → Scene 3: Open the mission briefing */

document.addEventListener("DOMContentLoaded", function () {
  const continueButton = document.getElementById("continueToMission");
  const transmissionScreen = document.getElementById("transmissionScreen");
  const missionScreen = document.getElementById("missionScreen");

  if (continueButton && transmissionScreen && missionScreen) {
    continueButton.addEventListener("click", function () {
      transmissionScreen.style.display = "none";
      missionScreen.hidden = false;
    });
  }
});

/* Botanical Workstation → Dr. Xyla's Animal Investigation Transmission */

document.addEventListener("DOMContentLoaded", function () {
  const animalButton = document.getElementById("beginAnimalInvestigation");
  const animalTransmission = document.getElementById("animalTransmissionScreen");

  if (animalButton && animalTransmission) {
    animalButton.addEventListener("click", function () {
// Check for unnamed botanical specimens before proceeding
if (!botanicalNamesComplete()) {
  document.querySelector(".shell").style.display = "none";
  document.querySelector("header.top").style.display = "none";

  const namingReminder = document.getElementById("namingReminderScreen");
  namingReminder.hidden = false;
  namingReminder.style.display = "flex";

  return;
}



      // Hide the botanical workstation
      document.querySelector(".shell").style.display = "none";

      // Hide its navigation header
      document.querySelector("header.top").style.display = "none";
// Retrieve the researcher's name for this investigation
const selectedInvestigation =
  sessionStorage.getItem("alien-selected-investigation");

const researchKey =
  selectedInvestigation === "a1" ? "alien-a1-v1" : "alien-a0-v1";

let researcherName = "Researcher";

try {
  const savedResearch =
    JSON.parse(localStorage.getItem(researchKey)) || {};

  researcherName = savedResearch.researcherName || "Researcher";
} catch {
  researcherName = "Researcher";
}

// Personalize Dr. Xyla's greeting
document.getElementById("animalResearcherName").textContent =
  researcherName;
      // Show Dr. Xyla's transmission
animalTransmission.hidden = false;
animalTransmission.style.display = "flex";

    });
  }
});

/* Naming Reminder → Research Notebook */

document.addEventListener("DOMContentLoaded", function () {
  const returnButton = document.getElementById("returnToNaming");
  const namingReminder = document.getElementById("namingReminderScreen");

  if (returnButton && namingReminder) {
    returnButton.addEventListener("click", function () {

      // Close the naming reminder
      namingReminder.hidden = true;
      namingReminder.style.display = "none";

      // Restore the botanical workstation
      document.querySelector(".shell").style.display = "";
      document.querySelector("header.top").style.display = "";

      // Open the Research Notebook
      state.tab = "notebook";
      render();

      // Update the navigation highlight
      document.querySelectorAll(".tab").forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.tab === "notebook"
        );
      });

    });
  }
});

/* Naming Reminder → Continue with Expedition Reference Names */

document.addEventListener("DOMContentLoaded", function () {
  const continueButton = document.getElementById("continueWithReferenceNames");
  const namingReminder = document.getElementById("namingReminderScreen");
  const animalTransmission = document.getElementById("animalTransmissionScreen");

  if (continueButton && namingReminder && animalTransmission) {
    continueButton.addEventListener("click", function () {

      // Fill missing names without replacing student-created names.
      adoptReferenceNames();

      // If any naming conflicts remain, return to the Research Notebook.
      if (!botanicalNamesComplete()) {
        namingReminder.hidden = true;
        namingReminder.style.display = "none";

        document.querySelector(".shell").style.display = "";
        document.querySelector("header.top").style.display = "";

        state.tab = "notebook";
        render();

        document.querySelectorAll(".tab").forEach(button => {
          button.classList.toggle(
            "active",
            button.dataset.tab === "notebook"
          );
        });

        return;
      }

      // Retrieve the saved researcher's name.
      const selectedInvestigation =
        sessionStorage.getItem("alien-selected-investigation");

      const researchKey =
        selectedInvestigation === "a1" ? "alien-a1-v1" : "alien-a0-v1";

      let researcherName = "Researcher";

      try {
        const savedResearch =
          JSON.parse(localStorage.getItem(researchKey)) || {};

        researcherName = savedResearch.researcherName || "Researcher";
      } catch {
        researcherName = "Researcher";
      }

      document.getElementById("animalResearcherName").textContent =
        researcherName;

      // Close the reminder and keep the original selection screen hidden.
namingReminder.hidden = true;
namingReminder.style.display = "none";

const selectionScreen = document.getElementById("investigationSelectScreen");
selectionScreen.hidden = true;
selectionScreen.style.display = "none";

// Open Dr. Xyla's animal investigation transmission.
animalTransmission.hidden = false;
animalTransmission.style.display = "flex";

    });
  }
});

/* Dr. Xyla → Dr. Kaelo: Animal Investigation Transmission */

document.addEventListener("DOMContentLoaded", function () {
  const continueButton = document.getElementById("continueToKaelo");
  const xylaScreen = document.getElementById("animalTransmissionScreen");
  const kaeloScreen = document.getElementById("kaeloTransmissionScreen");

  if (continueButton && xylaScreen && kaeloScreen) {
    continueButton.addEventListener("click", function () {

      // Carry the researcher's name into Dr. Kaelo's greeting.
      const researcherName =
        document.getElementById("animalResearcherName").textContent;

      document.getElementById("kaeloResearcherName").textContent =
        researcherName;

      // Close Dr. Xyla's transmission.
      xylaScreen.hidden = true;
      xylaScreen.style.display = "none";

      // Open Dr. Kaelo's transmission.
      kaeloScreen.hidden = false;
      kaeloScreen.style.display = "flex";

    });
  }
});

/* Scene 3 → Selected Workstation or Investigation Selection */
document.addEventListener("DOMContentLoaded", function () {
  const launchButton = document.getElementById("launchWorkstation");
  const missionScreen = document.getElementById("missionScreen");
  const selectionScreen = document.getElementById("investigationSelectScreen");

  if (launchButton && missionScreen && selectionScreen) {
    launchButton.addEventListener("click", function () {
      const priorChoice = sessionStorage.getItem("alien-intro-choice");

      missionScreen.style.display = "none";

      if (priorChoice === "a0" || priorChoice === "a1") {
        // The student already selected an investigation in the archive.
        sessionStorage.removeItem("alien-intro-choice");
        selectionScreen.hidden = true;
        selectionScreen.style.display = "none";
      } else {
        // First-time students must choose their investigation.
        selectionScreen.hidden = false;
        selectionScreen.style.display = "flex";
      }
    });
  }
});




/* Launch the student's selected investigation */
document.addEventListener("DOMContentLoaded", function () {
  const selectA0 = document.getElementById("selectA0");
  const selectA1 = document.getElementById("selectA1");
  const researcherInput = document.getElementById("researcherNameInput");

  function launchInvestigation(choice) {
    const key = choice === "a1" ? "alien-a1-v1" : "alien-a0-v1";
    const enteredName = researcherInput
      ? researcherInput.value.trim()
      : "";

    // Preserve existing research while adding the researcher name.
    let savedResearch = {};

    try {
      savedResearch = JSON.parse(localStorage.getItem(key)) || {};
    } catch {
      savedResearch = {};
    }

    // Only update the name if the student entered one.
    if (enteredName) {
      savedResearch.researcherName = enteredName;
      localStorage.setItem(key, JSON.stringify(savedResearch));
    }

    sessionStorage.setItem("alien-selected-investigation", choice);
    sessionStorage.setItem("alien-launch-selected", "true");
    window.location.reload();
  }

  if (selectA0) {
    selectA0.addEventListener("click", function () {
      launchInvestigation("a0");
    });
  }

  if (selectA1) {
    selectA1.addEventListener("click", function () {
      launchInvestigation("a1");
    });
  }
});
/* Dr. Kaelo → Animal Identification Workstation */
document.addEventListener("DOMContentLoaded", function () {

  const startButton = document.getElementById("continueToAnimalWorkstation");
  const kaeloScreen = document.getElementById("kaeloTransmissionScreen");
  const tankPrototype = document.getElementById("animalWorkstation");

  if (startButton && kaeloScreen && tankPrototype) {

    startButton.addEventListener("click", function () {

      // Close Dr. Kaelo's transmission
      kaeloScreen.hidden = true;
      kaeloScreen.style.display = "none";

      // Display the specimen tank
      tankPrototype.hidden = false;
      tankPrototype.style.display = "block";

// Permanently unlock Task 2 for this investigation
state.zoologyUnlocked = true;
save();

      // Hide the botanical workstation
      document.querySelector(".shell").style.display = "none";
      document.querySelector("header.top").style.display = "none";

    });

  }

});

/* ========================================
   XENOZOOLOGY — SPECIMEN SELECTION
   ======================================== */

document.addEventListener("DOMContentLoaded", function () {

  const gallery = document.getElementById("animalSpecimenGallery");
  const observationPanel = document.querySelector(".animal-observation-panel");
  const observationCreature = document.querySelector(
    "#specimenTankPrototype .tank-creature"
  );

  if (!gallery || !observationPanel || !observationCreature) return;

  gallery.addEventListener("click", function (event) {

    const selectedCard = event.target.closest(".gallery-specimen");
    if (!selectedCard) return;

    const selectedCreature = selectedCard.querySelector(".tank-creature");
    if (!selectedCreature) return;

// Clear the identification form when a specimen is selected.
const speciesInput = document.getElementById("animalSpeciesInput");
const feedback = document.getElementById("animalIdentificationFeedback");

if (speciesInput) {
  speciesInput.value = "";
}

if (feedback) {
  feedback.textContent = "";
}

// Return any previously examined specimens to their habitats
gallery.querySelectorAll(".gallery-specimen .tank-creature").forEach(function (creature) {
  creature.hidden = false;
});

// Temporarily remove the selected specimen from its habitat
selectedCreature.hidden = true;

    // Display the selected animal in the observation chamber
    observationCreature.src = selectedCreature.src;
    observationCreature.alt = selectedCreature.alt;
observationCreature.hidden = false;

// Match the observation chamber animation to the selected genus
observationCreature.classList.toggle(
  "observing-mupal",
  selectedCard.dataset.specimen.startsWith("M-")
);

    // Highlight the selected gallery specimen
    gallery.querySelectorAll(".gallery-specimen").forEach(function (card) {
      card.classList.remove("selected");
    });

    selectedCard.classList.add("selected");

    // Display the specimen number
    let specimenHeading = document.getElementById("selectedSpecimenHeading");

    if (!specimenHeading) {
      specimenHeading = document.createElement("h3");
      specimenHeading.id = "selectedSpecimenHeading";
      observationPanel.insertBefore(
        specimenHeading,
        document.getElementById("specimenTankPrototype")
      );
    }

    specimenHeading.textContent =
      "EXAMINING SPECIMEN " + selectedCard.dataset.specimen;

  });

});

/* ========================================
   DAY 1 — COMPLETION TRANSMISSION MEMORY
   ======================================== */

function getDay1CompletionStorageKey() {
  return "alien-day1-completion-shown-" + mode;
}

/* ========================================
   XENOZOOLOGY — REQUIRED IDENTIFICATIONS
   ======================================== */

function getAnimalIdentificationProgress() {

  const identifiedIds = Object.keys(
    state.identifiedAnimals || {}
  );

  const mupals = identifiedIds.filter(
    id => id.startsWith("M-")
  ).length;

  const hooplers = identifiedIds.filter(
    id => id.startsWith("H-")
  ).length;

  return {
    mupals: mupals,
    hooplers: hooplers,
    complete: mupals >= 2 && hooplers >= 2
  };
}
function updateAnimalIdentificationProgress() {

  const progress = getAnimalIdentificationProgress();

  const mupalDisplay = document.getElementById("mupalProgress");
  const hooplerDisplay = document.getElementById("hooplerProgress");

  if (mupalDisplay) {
    mupalDisplay.textContent = progress.mupals + " / 2";
  }

  if (hooplerDisplay) {
    hooplerDisplay.textContent = progress.hooplers + " / 2";
  }
  if (progress.complete && !state.day1CompletionShown) {

  // Remember that this investigation has received
  // its Day 1 completion transmission.
  state.day1CompletionShown = true;
  save();

  // Display the congratulations transmission.
  showDay1CompletionTransmission();

}
}

/* ========================================
   DAY 1 — COMPLETION TRANSMISSION
   ======================================== */

function showDay1CompletionTransmission() {

  const completionMessage =
    document.getElementById("day1CompletionMessage");

  if (!completionMessage) return;

  // Retrieve the researcher's saved name.
  const studentName =
    state.researcherName?.trim() || "researcher";

  // Personalize the congratulations message.
  const nameDisplay =
    document.getElementById("day1CompletionStudentName");

  if (nameDisplay) {
    nameDisplay.textContent = studentName;
  }

  // Display the completion transmission.
  completionMessage.hidden = false;
}
/* ========================================
   DAY 1 — RETURN TO RESEARCH
   ======================================== */

document.getElementById("day1ReturnToResearch")
  ?.addEventListener("click", function () {

    // Close the completion transmission.
    const completionMessage =
      document.getElementById("day1CompletionMessage");

    if (completionMessage) {
      completionMessage.hidden = true;
    }

// Hide the returning investigator archive.
const resumeScreen =
  document.getElementById("resumeScreen");

if (resumeScreen) {
  resumeScreen.hidden = true;
  resumeScreen.style.display = "none";
}

    // Open the Xenozoology workstation.
    const animalWorkstation =
      document.getElementById("animalWorkstation");

    if (animalWorkstation) {
      animalWorkstation.hidden = false;
      animalWorkstation.style.display = "block";
    }

    // Hide the botanical workstation.
    const botanicalWorkstation =
      document.querySelector(".shell");

    if (botanicalWorkstation) {
      botanicalWorkstation.style.display = "none";
    }

    // Hide the botanical navigation header.
    const botanicalHeader =
      document.querySelector("header.top");

    if (botanicalHeader) {
      botanicalHeader.style.display = "none";
    }

  });
/* ========================================
   XENOZOOLOGY — DISPLAY CONFIRMED SPECIES
   ======================================== */

function updateIdentifiedAnimalCards() {

  const cards = document.querySelectorAll(
    "#animalSpecimenGallery .gallery-specimen"
  );

  cards.forEach(function (card) {

    const specimenId = card.dataset.specimen;
    const confirmedName = state.identifiedAnimals[specimenId];

    // Only display names that students have correctly identified.
    if (!confirmedName) return;

    // Prevent duplicate labels when the gallery updates.
    let nameLabel = card.querySelector(".confirmed-species-name");

    if (!nameLabel) {
      nameLabel = document.createElement("div");
      nameLabel.className = "confirmed-species-name";
      card.appendChild(nameLabel);
    }

    // Display the official scientific name in italics.
    nameLabel.textContent = confirmedName;
    nameLabel.style.fontStyle = "italic";

    // Mark the habitat card as successfully identified.
    card.classList.add("identified");

// Replace the unidentified status with a confirmed identification.
const statusLabel = Array.from(card.querySelectorAll("*")).find(
  element =>
    element.children.length === 0 &&
    element.textContent.trim() === "UNIDENTIFIED"
);

if (statusLabel) {
  statusLabel.textContent = "IDENTIFIED";
}

  });

}

// XENOZOOLOGY — FIELD GUIDE RECORDS
function updateAnimalFieldGuide() {

  const fieldGuide = document.getElementById(
    "animalFieldGuideEntries"
  );

  const gallery = document.getElementById(
    "animalSpecimenGallery"
  );

  if (!fieldGuide || !gallery) return;

  // Clear previous entries before rebuilding the Field Guide.
  fieldGuide.replaceChildren();

  // Retrieve the student's confirmed identifications.
  const identifiedAnimals = state.identifiedAnimals || {};

  Object.entries(identifiedAnimals)
  .sort(function ([idA], [idB]) {
    return idA.localeCompare(idB, undefined, { numeric: true });
  })
  .forEach(function ([specimenId, speciesName]) {

    // Find the corresponding specimen in the habitat gallery.
    const specimenCard = Array.from(
      gallery.querySelectorAll(".gallery-specimen")
    ).find(function (card) {
      return card.dataset.specimen === specimenId;
    });

    if (!specimenCard) return;

    const specimenImage = specimenCard.querySelector(".tank-creature");
    if (!specimenImage) return;

    // Create the Field Guide entry.
    const entry = document.createElement("div");
    entry.className = "animal-field-guide-entry";

    const image = document.createElement("img");
    image.src = specimenImage.src;
    image.alt = "Illustration of " + speciesName;
    image.className = "animal-field-guide-image";

    const details = document.createElement("div");
    details.className = "animal-field-guide-details";

    const specimenNumber = document.createElement("span");
    specimenNumber.className = "animal-field-guide-number";
    specimenNumber.textContent = "SPECIMEN " + specimenId;

    const scientificName = document.createElement("em");
    scientificName.className = "animal-field-guide-species";
    scientificName.textContent = speciesName;

    details.append(specimenNumber, scientificName);
    entry.append(image, details);

    fieldGuide.appendChild(entry);

  });

}
/* ========================================
   BOTANY — FIELD GUIDE RECORDS
   ======================================== */

function updatePlantFieldGuide() {

  const fieldGuide = document.getElementById(
    "plantFieldGuideEntries"
  );

  if (!fieldGuide) return;

  // Clear existing cards before rebuilding the guide.
  fieldGuide.replaceChildren();

  // Only include plants isolated in the student's key.
  const isolatedPlants = ids.filter(function (id) {
    return leafNodes().some(function (branch) {
      return branch.plants[0] === id;
    });
  });

  // Display specimens in numerical order.
  isolatedPlants.sort(function (a, b) {
    return a.localeCompare(b, undefined, { numeric: true });
  });

  isolatedPlants.forEach(function (id) {

    const speciesName = fieldGuidePlantName(id);

    const entry = document.createElement("div");
    entry.className = "animal-field-guide-entry";

    const image = document.createElement("img");
    image.src = pic(id);
    image.alt = "Illustration of " + speciesName;
    image.className = "animal-field-guide-image";

    const details = document.createElement("div");
    details.className = "animal-field-guide-details";

    const specimenNumber = document.createElement("span");
    specimenNumber.className = "animal-field-guide-number";
    specimenNumber.textContent = "SPECIMEN " + id;

    const scientificName = document.createElement("em");
    scientificName.className = "animal-field-guide-species";
    scientificName.textContent = speciesName;

    details.append(specimenNumber, scientificName);
    entry.append(image, details);

    fieldGuide.appendChild(entry);

  });
}
// Restore previously identified species and progress.
document.addEventListener("DOMContentLoaded", function () {
  updateIdentifiedAnimalCards();
  updateAnimalFieldGuide();
  updateAnimalIdentificationProgress();
});

/* ========================================
   XENOZOOLOGY — GALLERY TAB SWITCHING
   ======================================== */

document.addEventListener("DOMContentLoaded", function () {
  const gallery = document.getElementById("animalSpecimenGallery");
  const tabs = document.querySelectorAll(".specimen-gallery-tab");

  if (!gallery || !tabs.length) return;

  function showGallery(genus) {
    // Update the active tab
    tabs.forEach(function (tab) {
      const isActive = tab.dataset.gallery === genus;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });

    // Show only specimens belonging to the selected genus
    gallery.querySelectorAll(".gallery-specimen").forEach(function (card) {
      const specimenId = card.dataset.specimen;

      const belongsToGallery =
        genus === "mupal"
          ? specimenId.startsWith("M-")
          : specimenId.startsWith("H-");

      card.hidden = !belongsToGallery;
    });
  }

  // Switch galleries when a tab is clicked
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      showGallery(tab.dataset.gallery);
    });
  });

  // Begin with the Mupal gallery
  showGallery("mupal");
});

// ========================================
// RESEARCH NOTEBOOK — OPEN AND CLOSE
// ========================================

const researchNotebookOverlay = document.getElementById("researchNotebookOverlay");
const closeResearchNotebook = document.getElementById("closeResearchNotebook");

// Open notebook from either workstation
document.querySelectorAll(".research-notebook-btn").forEach(button => {
  button.addEventListener("click", () => {

    // Refresh the Xenozoology navigation button.
    const zoologyButton = document.getElementById("notebookZoology");

    if (zoologyButton && state.zoologyUnlocked === true) {
      zoologyButton.disabled = false;

      const arrow = zoologyButton.querySelector(
        ".notebook-investigation-arrow"
      );

      if (arrow) {
        arrow.textContent = "→";
      }
    }

    researchNotebookOverlay.hidden = false;
    console.log("Notebook opened:", researchNotebookOverlay.hidden);
  });
});

// Close notebook
closeResearchNotebook.addEventListener("click", () => {
  researchNotebookOverlay.hidden = true;
});

// Skip both scientist transmissions
document.getElementById("skipXylaIntroduction")?.addEventListener("click", () => {

  // Hide Dr. Xyla's transmission
  const xylaScreen = document.getElementById("animalTransmissionScreen");
  xylaScreen.hidden = true;
  xylaScreen.style.display = "none";

  // Hide Dr. Kaelo's transmission
  const kaeloScreen = document.getElementById("kaeloTransmissionScreen");
  kaeloScreen.hidden = true;
  kaeloScreen.style.display = "none";

  // Open the zoology workstation
  const animalWorkstation = document.getElementById("animalWorkstation");
  animalWorkstation.hidden = false;
  animalWorkstation.style.display = "block";

// Record that the researcher has reached Xenozoology.
state.zoologyUnlocked = true;
save();

  // Hide the botanical workstation and its navigation header
  document.querySelector(".shell").style.display = "none";
  document.querySelector("header.top").style.display = "none";

});

// Skip Dr. Kaelo's transmission
document.getElementById("skipKaeloIntroduction")?.addEventListener("click", () => {
  document.getElementById("continueToAnimalWorkstation").click();
});

/* ========================================
   RESEARCH NOTEBOOK — INVESTIGATION UNLOCKS
   ======================================== */

document.addEventListener("DOMContentLoaded", function () {

  const zoologyButton = document.getElementById("notebookZoology");

  if (!zoologyButton) return;

  // Check whether this investigation has unlocked zoology
  if (state.zoologyUnlocked === true) {

    zoologyButton.disabled = false;

    // Replace the lock with a navigation arrow
    const icon = zoologyButton.querySelector(
      ".notebook-investigation-arrow"
    );

    if (icon) {
      icon.textContent = "→";
    }

  }

});

/* ========================================
   RESEARCH NOTEBOOK — RETURN TO BOTANY
   ======================================== */

document.getElementById("notebookBotany")?.addEventListener("click", function () {

  // Close the Research Notebook
  document.getElementById("researchNotebookOverlay").hidden = true;

  // Hide the zoology workstation
  const animalWorkstation = document.getElementById("animalWorkstation");
  animalWorkstation.hidden = true;
  animalWorkstation.style.display = "none";

  // Restore the botanical workstation
  document.querySelector(".shell").style.display = "";

  // Restore the botanical navigation header
  document.querySelector("header.top").style.display = "";

});

/* ========================================
   RESEARCH NOTEBOOK — RETURN TO ZOOLOGY
   ======================================== */

document.getElementById("notebookZoology")?.addEventListener("click", function () {

  // Only allow access if zoology has been unlocked
  if (state.zoologyUnlocked !== true) return;

  // Close the Research Notebook
  document.getElementById("researchNotebookOverlay").hidden = true;

  // Hide the botanical workstation and its header
  document.querySelector(".shell").style.display = "none";
  document.querySelector("header.top").style.display = "none";

  // Hide both scientist transmissions
  ["animalTransmissionScreen", "kaeloTransmissionScreen"].forEach(function (id) {
    const screen = document.getElementById(id);
    if (screen) {
      screen.hidden = true;
      screen.style.display = "none";
    }
  });

  // Open the zoology workstation
  const animalWorkstation = document.getElementById("animalWorkstation");
  animalWorkstation.hidden = false;
  animalWorkstation.style.display = "block";

});

/* ========================================
   XENOZOOLOGY — OFFICIAL SPECIES RECORDS
   ======================================== */

const animalSpeciesReference = {
  "M-01": "Mupal zape",
  "M-02": "Mupal ploby",
  "M-03": "Mupal snin",
  "M-04": "Mupal denkip",
  "M-05": "Mupal molish",
  "M-06": "Mupal xop",
  "M-07": "Mupal byz",
  "M-08": "Mupal dupy",
  "M-09": "Mupal tabilly",
  "M-10": "Mupal fush",

  "H-01": "Hoopler siana",
  "H-02": "Hoopler espes",
  "H-03": "Hoopler agrip",
  "H-04": "Hoopler floin",
  "H-05": "Hoopler zulka",
  "H-06": "Hoopler jarb",
  "H-07": "Hoopler drebb",
  "H-08": "Hoopler higg",
  "H-09": "Hoopler bexil",
  "H-10": "Hoopler verfi"
};

/* ========================================
   XENOZOOLOGY — IDENTIFICATION SUBMISSION
   ======================================== */

document.getElementById("submitAnimalIdentification")
  ?.addEventListener("click", function () {

    const speciesInput = document.getElementById("animalSpeciesInput");
    const feedback = document.getElementById("animalIdentificationFeedback");

    const proposedSpecies = speciesInput.value.trim();

    if (proposedSpecies === "") {
      feedback.textContent =
        "Enter a scientific name before submitting your identification.";
      return;
    }

    const selectedCard = document.querySelector(
  "#animalSpecimenGallery .gallery-specimen.selected"
);

if (!selectedCard) {
  feedback.textContent =
    "Select a specimen from the habitat gallery before submitting an identification.";
  return;
}

const specimenId = selectedCard.dataset.specimen;

// Retrieve the official scientific name for this specimen.
const correctSpecies = animalSpeciesReference[specimenId];

if (!correctSpecies) {
  feedback.textContent =
    "Species reference unavailable for this specimen.";
  return;
}

// Compare names without penalizing capitalization.
// Extra spaces between words are also ignored.
const normalizedAnswer = proposedSpecies
  .replace(/\s+/g, " ")
  .toLowerCase();

const normalizedCorrect = correctSpecies.toLowerCase();

if (normalizedAnswer === normalizedCorrect) {

// Record the confirmed identification using its official scientific name.
state.identifiedAnimals[specimenId] = correctSpecies;

// Preserve the discovery in the student's research record.
save();
updateIdentifiedAnimalCards();
updateAnimalIdentificationProgress();

// Clear the text box after a correct identification.
speciesInput.value = "";

  // Check whether the student used scientific capitalization.
  const correctlyCapitalized =
    proposedSpecies.replace(/\s+/g, " ") === correctSpecies;

  if (correctlyCapitalized) {
    feedback.textContent =
      "Correct identification! You have identified " +
      correctSpecies +
      ".";
  } else {
    feedback.textContent =
      "Correct identification! You have identified " +
      correctSpecies +
      ". Scientific naming reminder: The genus begins with " +
      "a capital letter, while the species epithet is lowercase.";
  }

} else {

  // Check whether the student entered only one word.
  const words = proposedSpecies.trim().split(/\s+/);

  if (words.length === 1) {
    feedback.textContent =
      "Please include both the genus and species name in your identification.";
  } else {
    feedback.textContent =
      "That identification does not match the selected specimen. " +
      "Reexamine its characteristics and follow Dr. Kaelo's " +
      "dichotomous key again.";
  }

}

  });

/* ========================================
   RESEARCH NOTEBOOK — FIELD GUIDE NAVIGATION
   ======================================== */

document.addEventListener("DOMContentLoaded", function () {

  const fieldGuideButton = document.getElementById("notebookFieldGuide");
  const fieldGuide = document.getElementById("expeditionFieldGuide");
  const notebookMenu = document.querySelector(".research-notebook-content");
const backButton = document.getElementById("backToNotebook");

  if (!fieldGuideButton || !fieldGuide || !notebookMenu) return;

  fieldGuideButton.addEventListener("click", function () {

    // Hide the notebook's main menu content.
    Array.from(notebookMenu.children).forEach(function (element) {
      if (element !== fieldGuide) {
        element.hidden = true;
      }
    });

    // Display the Field Guide.
fieldGuide.hidden = false;

// Restart the page-turn animation.
fieldGuide.classList.remove("page-turning");
void fieldGuide.offsetWidth;
fieldGuide.classList.add("page-turning");

// Refresh the student's confirmed species records.
updatePlantFieldGuide();
updateAnimalFieldGuide();

  });

  // Return to the Research Notebook's main menu.
  if (backButton) {
    backButton.addEventListener("click", function () {

      // Hide the Field Guide.
      fieldGuide.hidden = true;

      // Restore the main menu content.
      Array.from(notebookMenu.children).forEach(function (element) {
        if (element !== fieldGuide) {
          element.hidden = false;
        }
      });

    });
  }

});