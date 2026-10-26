"use client";

import styles from "./policy-back-button.module.css";

export default function PolicyBackButton() {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    if (document.referrer) {
      const previousPage = new URL(document.referrer);
      if (previousPage.origin === window.location.origin && previousPage.href !== window.location.href) {
        window.location.assign(previousPage.href);
        return;
      }
    }

    window.location.assign("/");
  };

  return (
    <nav className={styles.bar} aria-label="Policy page navigation">
      <div className={styles.inner}>
        <button className={styles.button} type="button" onClick={goBack}>
          <span aria-hidden="true">←</span> Back
        </button>
      </div>
    </nav>
  );
}
