// czas
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}`;
  document.getElementById('date').textContent = `${day}/${month}`;
}
setInterval(updateTime, 1000);
updateTime();
//tworzenie paneli
function createTextRow() {
  const div = document.createElement('div');
  div.className = 'window col-span-4';
  div.innerHTML = `
    <div class="window-header">
      <div class="flex items-center">
        <div class="dot bg-red-500"></div>
        <div class="dot bg-yellow-400"></div>
        <div class="dot bg-green-500"></div>
      </div>
      <span class="text-sm">Nowy tekst</span>
    </div>
    <div class="window-content">
      <textarea class="w-full bg-transparent text-cyan-100 font-mono outline-none p-2" placeholder="Wpisz opis..."></textarea>
    </div>
  `;
  return div;
}
//chatgpt
function createMediaRow() {
  // Create a container for the two boxes (col-span-3 and col-span-1)
  const fragment = document.createDocumentFragment();

  // Left box (text/info, col-span-3)
  const leftDiv = document.createElement('div');
  leftDiv.className = 'window col-span-3';
  leftDiv.innerHTML = `
    <div class="window-header">
      <div class="flex items-center">
        <div class="dot bg-red-500"></div>
        <div class="dot bg-yellow-400"></div>
        <div class="dot bg-green-500"></div>
      </div>
      <span class="text-sm">Nowy tekst + media</span>
    </div>
    <div class="window-content">
      <textarea class="w-full bg-transparent text-cyan-100 font-mono outline-none p-2 mb-2" placeholder="Wpisz opis lub tekst..."></textarea>
    </div>
  `;

  // Right box (media, col-span-1)
  const rightDiv = document.createElement('div');
  rightDiv.className = 'window col-span-1';
  rightDiv.innerHTML = `
    <div class="window-header">
      <div class="flex items-center">
        <div class="dot bg-red-500"></div>
        <div class="dot bg-yellow-400"></div>
        <div class="dot bg-green-500"></div>
      </div>
      <span class="text-sm">Nowe media</span>
    </div>
    <div class="window-content">
      <input type="file" accept="video/mp4,video/webm,video/ogg" class="mb-2 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-600 file:text-white" />
      <video class="w-full object-cover rounded-lg mt-2" controls style="display:none"></video>
    </div>
  `;

  // Add file picker logic
  const fileInput = rightDiv.querySelector('input[type="file"]');
  const video = rightDiv.querySelector('video');
  fileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      video.src = URL.createObjectURL(file);
      video.style.display = 'block';
      video.load();
    }
  });

  fragment.appendChild(leftDiv);
  fragment.appendChild(rightDiv);
  return fragment;
}
document.getElementById('addTextRow').onclick = function() {
  const grid = document.getElementById('dynamicGrid');
  const box = createTextRow();
  grid.insertBefore(box, grid.firstChild);
  animateAddBox(box);
};

document.getElementById('addMediaRow').onclick = function() {
  const grid = document.getElementById('dynamicGrid');
  const fragment = createMediaRow();
  // Animate both boxes in the fragment
  Array.from(fragment.children).forEach(box => animateAddBox(box));
  grid.insertBefore(fragment, grid.firstChild);
};

// Function to handle delete button click
function handleDeleteClick(e) {
  // Find the closest .window
  const windowDiv = e.target.closest('.window');
  if (!windowDiv) return;

  // If it's a col-span-3, also remove the next col-span-1 (media row)
  if (windowDiv.classList.contains('col-span-3')) {
    const next = windowDiv.nextElementSibling;
    if (next && next.classList.contains('window') && next.classList.contains('col-span-1')) {
      animateDeleteBox(windowDiv, () => windowDiv.remove());
      animateDeleteBox(next, () => next.remove());
    } else {
      animateDeleteBox(windowDiv, () => windowDiv.remove());
    }
  }
  // If it's a col-span-1 and previous is col-span-3, do nothing (handled above)
  else if (windowDiv.classList.contains('col-span-1')) {
    const prev = windowDiv.previousElementSibling;
    if (!(prev && prev.classList.contains('window') && prev.classList.contains('col-span-3'))) {
      animateDeleteBox(windowDiv, () => windowDiv.remove());
    }
  }
  // For col-span-4 or others, just remove
  else {
    animateDeleteBox(windowDiv, () => windowDiv.remove());
  }
}

// Utility: exit fullscreen for all windows
function exitFullscreenAll() {
  document.querySelectorAll('.window').forEach(w => {
    // Add a class to trigger transition (already handled by CSS)
    w.classList.remove('fullscreen');
    w.classList.remove('bg-blur');
  });
}
// Add animation when adding a box
function animateAddBox(box) {
  box.classList.add('anim-add');
  setTimeout(() => box.classList.remove('anim-add'), 400);
}
// Add animation when deleting a box
function animateDeleteBox(box, callback) {
  box.classList.add('anim-del');
  setTimeout(() => {
    callback();
  }, 300);
}


// Attach event delegation to the grid
document.getElementById('dynamicGrid').addEventListener('click', function(e) {
  // If any dot is clicked and a window is in fullscreen, exit fullscreen first
  if (
    e.target.classList.contains('bg-red-500') ||
    e.target.classList.contains('bg-yellow-400') ||
    e.target.classList.contains('bg-green-500')
  ) {
    const anyFullscreen = document.querySelector('.window.fullscreen');
    if (anyFullscreen) {
      exitFullscreenAll();
      // Prevent further action if you want only to exit fullscreen on first click
      return;
      // If you want the button to also perform its normal action after exiting fullscreen, do not return
    }
  }

  // Red button: delete
  if (e.target.classList.contains('bg-red-500')) {
    handleDeleteClick(e);
  }

  // Green button: toggle content
  if (e.target.classList.contains('bg-green-500')) {
    const windowDiv = e.target.closest('.window');
    const content = windowDiv.querySelector('.window-content');
    if (content) {
      content.classList.toggle('collapsed');
    }
  }

  // Yellow button: fullscreen
  if (e.target.classList.contains('bg-yellow-400')) {
    const windowDiv = e.target.closest('.window');
    const allWindows = document.querySelectorAll('.window');
    const isFullscreen = windowDiv.classList.contains('fullscreen');

    // Remove fullscreen from all windows
    allWindows.forEach(w => {
      w.classList.remove('fullscreen');
      w.classList.remove('bg-blur');
    });

    if (!isFullscreen) {
      // Blur all except the one going fullscreen
      allWindows.forEach(w => {
        if (w !== windowDiv) w.classList.add('bg-blur');
      });
      windowDiv.classList.add('fullscreen');
    }
  }
});