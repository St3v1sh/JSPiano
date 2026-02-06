export class SheetDisplay {
  constructor(seekCallback) {
    this.dom = {
      title: document.getElementById("sheetTitle"),
      meta: document.getElementById("sheetMeta"),
      left: document.getElementById("sheetLeft"),
      right: document.getElementById("sheetRight"),
      prev: document.getElementById("btnPrev"),
      next: document.getElementById("btnNext"),
      indicator: document.getElementById("pageIndicator"),
    };

    this.seekCallback = seekCallback;

    // State
    this.sheetPagesHTML = [];
    this.lineToPageMap = [];
    this.pageIndex = 0;

    // Listeners
    this.dom.left.addEventListener("click", (e) => this.handleLineClick(e));
    this.dom.right.addEventListener("click", (e) => this.handleLineClick(e));
    this.dom.prev.onclick = () => this.changePage(-1);
    this.dom.next.onclick = () => this.changePage(1);
  }

  reset() {
    this.sheetPagesHTML = [];
    this.lineToPageMap = [];
    this.pageIndex = 0;
    this.render();
  }

  load(songObject) {
    if (!songObject) return;

    const { title, artist, bpm, scale, sheet } = songObject;

    this.dom.title.innerText = title;
    // Add artist if it exists
    const artistText = artist ? ` - ${artist}` : "";
    this.dom.title.innerText += artistText;

    this.dom.meta.innerText = `BPM: ${bpm} | Scale: ${scale}`;

    this.sheetPagesHTML = [];
    this.lineToPageMap = [];

    let currentPageHTML = "";
    let currentPageIndex = 0;

    sheet.forEach((line, globalIdx) => {
      if (line.trim() === "~") {
        this.sheetPagesHTML.push(currentPageHTML);
        currentPageHTML = "";
        currentPageIndex++;
        this.lineToPageMap[globalIdx] = currentPageIndex;
      } else {
        const safeContent =
          line
            .replace(/ /g, "&nbsp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;") || "&nbsp;";
        currentPageHTML += `<div class="sheet-line" id="line-${globalIdx}">${safeContent}</div>`;
        this.lineToPageMap[globalIdx] = currentPageIndex;
      }
    });

    if (currentPageHTML) this.sheetPagesHTML.push(currentPageHTML);

    this.pageIndex = 0;
    this.render();
  }

  render() {
    if (this.sheetPagesHTML.length === 0) {
      this.dom.left.innerHTML = "No sheet selected.";
      this.dom.right.innerHTML = "";
      this.dom.indicator.innerText = "--";
      this.dom.prev.disabled = true;
      this.dom.next.disabled = true;
      return;
    }

    this.dom.left.innerHTML = this.sheetPagesHTML[this.pageIndex] || "";
    this.dom.right.innerHTML = this.sheetPagesHTML[this.pageIndex + 1] || "";

    const dL = this.pageIndex + 1;
    const dR = this.pageIndex + 2;
    this.dom.indicator.innerText = `Pg ${dL}-${dR}`;

    this.dom.prev.disabled = this.pageIndex <= 0;
    this.dom.next.disabled = this.pageIndex + 2 >= this.sheetPagesHTML.length;
  }

  changePage(dir) {
    const newIndex = this.pageIndex + dir * 2;
    if (newIndex >= 0 && newIndex < this.sheetPagesHTML.length) {
      this.pageIndex = newIndex;
      this.render();
    }
  }

  highlightLine(globalIndex) {
    // 1. Ensure visible
    if (globalIndex < this.lineToPageMap.length) {
      const targetPage = this.lineToPageMap[globalIndex];
      const requiredStart = Math.floor(targetPage / 2) * 2;
      if (requiredStart !== this.pageIndex) {
        this.pageIndex = requiredStart;
        this.render();
      }
    }

    // 2. CSS Highlight
    const old = document.querySelectorAll(".active-line");
    old.forEach((el) => el.classList.remove("active-line"));

    const el = document.getElementById(`line-${globalIndex}`);
    if (el) el.classList.add("active-line");
  }

  clearHighlight() {
    const old = document.querySelectorAll(".active-line");
    old.forEach((el) => el.classList.remove("active-line"));
  }

  handleLineClick(e) {
    const lineEl = e.target.closest(".sheet-line");
    if (lineEl) {
      const index = parseInt(lineEl.id.replace("line-", ""), 10);
      if (!isNaN(index)) {
        this.seekCallback(index);
      }
    }
  }
}
