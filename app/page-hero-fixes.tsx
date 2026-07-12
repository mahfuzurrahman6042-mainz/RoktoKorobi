// Hero Section Fixes for app/page.tsx
// Apply these changes to the hero section in app/page.tsx

/*
REPLACE the hero section styles and markup:

1. Hero Card - Remove oversized watermark artifacts
2. Primary CTA - Set max-width to 560px, height 56px
3. Secondary CTA - Same width and height as primary
4. Live Badge - Keep as non-interactive status badge
5. Remove large faint "123" background artifact

Key CSS updates:
```
.hero-card {
  position: relative;
  background: #1C1010;
  border-radius: 18px;
  padding: clamp(20px, 4vw, 36px);
  overflow: hidden;
  margin: auto;
  width: 100%;
  max-width: 100%;
}

.card-btn-primary,
.card-btn-secondary {
  display: block;
  width: 100%;
  max-width: 560px;
  height: 56px;
  margin: 0 auto;
  padding: 0;
  border: none;
  border-radius: 100px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.card-btn-primary {
  background: #BE1528;
  color: #fff;
  margin-bottom: 12px;
}

.card-btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.8);
}

.btn-watermark-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 100px;
  display: block;
  height: 56px;
}

.btn-watermark-wrap .watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(35px, 12vw, 80px);
  font-weight: 800;
  color: rgba(255, 255, 255, 0.06);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}

.btn-watermark-wrap .card-btn-secondary {
  position: relative;
  z-index: 1;
}
```
*/
