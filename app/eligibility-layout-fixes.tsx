// Eligibility Page Layout Fixes
// Apply these changes to app/eligibility/page.tsx

/*
REQUIREMENTS:
1. Use reusable header component (import Header from '@/components/Header')
2. Two-column layout on desktop (collapses to one on tablet/mobile)
3. Standardize form controls to 52-56px height
4. "Check Eligibility" button: 56-64px, centered label, arrow icon on right
5. Ensure form constrained to column width
6. Use consistent spacing and border-radius

CSS Grid:
```
.eligibility-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .eligibility-layout {
    grid-template-columns: 1fr;
  }
}

.elig-form-control {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.elig-input,
.elig-select {
  height: 52px;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.elig-input:focus,
.elig-select:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.elig-check-btn {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 1.5rem;
  background: #BE1528;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.elig-check-btn:hover {
  background: #a01220;
}

.elig-check-btn:active {
  transform: scale(0.98);
}

.arrow-icon {
  width: 20px;
  height: 20px;
  margin-left: auto;
}
```
*/
