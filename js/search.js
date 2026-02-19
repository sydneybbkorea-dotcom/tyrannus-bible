// Search filter state and filter UI helpers
window.searchFilters = {OT:true, NT:true, notes:true, commentary:true};

function toggleAllFilters(checkbox){
  const checked = checkbox.checked;
  document.querySelectorAll('.search-filter').forEach(cb => {
    cb.checked = checked;
    searchFilters[cb.dataset.f] = checked;
  });
}

function updateSearchFilters(){
  const checkboxes = document.querySelectorAll('.search-filter');
  checkboxes.forEach(cb => {
    searchFilters[cb.dataset.f] = cb.checked;
  });
  // Update "all" checkbox state
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  const allCheckbox = document.getElementById('filter-all');
  if(allCheckbox) allCheckbox.checked = allChecked;
}
