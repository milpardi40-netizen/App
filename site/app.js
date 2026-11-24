(() => {
  const REPO = 'milpardi40-netizen/App';
  const RELEASES_API = `https://api.github.com/repos/${REPO}/releases?per_page=10`;

  function toPersianDigits(value) {
    return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
  }

  function formatMegabytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '';
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return `${toPersianDigits(mb)} مگابایت`;
  }

  function versionLabelFromRelease(release) {
    const body = String(release.body || '');
    const versionMatch = body.match(/version name\s+`([^`]+)`/i) || body.match(/versionCode:\s*(\d+)/i);
    if (versionMatch && versionMatch[1]) {
      return versionMatch[1].includes('.') ? versionMatch[1] : `1.0.${versionMatch[1]}`;
    }
    const tagMatch = String(release.tag_name || '').match(/(\d+)$/);
    return tagMatch ? `1.0.${100 + Number(tagMatch[1])}` : String(release.tag_name || '');
  }

  async function syncLatestApkRelease() {
    try {
      const res = await fetch(RELEASES_API, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!res.ok) return;
      const releases = await res.json();
      if (!Array.isArray(releases)) return;

      const latest = releases.find(
        (rel) =>
          !rel.draft &&
          Array.isArray(rel.assets) &&
          rel.assets.some((asset) => asset.name === '5update.apk'),
      );
      if (!latest) return;

      const findAsset = (name) => latest.assets.find((asset) => asset.name === name);
      const fiveApk = findAsset('5update.apk');
      const twoApk = findAsset('2update.apk');
      const enApk = findAsset('english.apk');
      const versionLabel = versionLabelFromRelease(latest);

      if (fiveApk) {
        const metaText = [
          versionLabel ? `نسخهٔ ${toPersianDigits(versionLabel)}` : '',
          formatMegabytes(fiveApk.size),
        ]
          .filter(Boolean)
          .join(' · ');

        document.querySelectorAll('[data-apk-primary]').forEach((el) => {
          el.setAttribute('href', fiveApk.browser_download_url);
        });
        if (metaText) {
          document.querySelectorAll('[data-apk-meta]').forEach((el) => {
            el.textContent = metaText;
          });
        }
      }

      if (twoApk) {
        document.querySelectorAll('[data-apk-two]').forEach((el) => {
          el.setAttribute('href', twoApk.browser_download_url);
        });
        const twoSize = formatMegabytes(twoApk.size);
        if (twoSize) {
          document.querySelectorAll('[data-apk-two-size]').forEach((el) => {
            el.textContent = twoSize;
          });
        }
      }
      if (enApk) {
        document.querySelectorAll('[data-apk-english]').forEach((el) => {
          el.setAttribute('href', enApk.browser_download_url);
        });
        const enSize = formatMegabytes(enApk.size);
        if (enSize) {
          document.querySelectorAll('[data-apk-en-size]').forEach((el) => {
            el.textContent = enSize;
          });
        }
      }

      if (latest.html_url) {
        document.querySelectorAll('[data-release-page]').forEach((el) => {
          el.setAttribute('href', latest.html_url);
        });
      }
      if (versionLabel) {
        document.querySelectorAll('[data-release-badge]').forEach((el) => {
          el.textContent = `v${versionLabel}`;
        });
      }
      if (latest.tag_name) {
        document.querySelectorAll('[data-release-tag]').forEach((el) => {
          el.textContent = `انتشار رسمی · ${latest.tag_name}`;
        });
      }
    } catch {
      // Keep the reliable static fallback URLs if GitHub API is unreachable.
    }
  }

  void syncLatestApkRelease();
})();
