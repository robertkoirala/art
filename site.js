(() => {
  const gallery = document.querySelector(".gallery");

  if (!gallery) {
    return;
  }

  const images = Array.from(gallery.querySelectorAll("img"));
  const projectTitle =
    document.querySelector(".project-title")?.textContent.trim() || "";

  if (images.length === 0) {
    return;
  }

  const photoIds = images.map((image, index) => {
    const source = image.getAttribute("src") || "";
    const filename = source.split("/").pop().split("?")[0].split("#")[0];
    const stem = filename.replace(/\.[^.]+$/, "");
    const slug = stem
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || String(index + 1);
  });

  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Fullscreen photograph viewer");
  dialog.innerHTML = `
    <div class="lightbox-inner">
      <button class="lightbox-control lightbox-close" type="button" aria-label="Close">×</button>
      <button class="lightbox-control lightbox-previous" type="button" aria-label="Previous photograph">‹</button>
      <figure class="lightbox-media">
        <img class="lightbox-image" alt="">
      </figure>
      <button class="lightbox-control lightbox-next" type="button" aria-label="Next photograph">›</button>
      <div class="lightbox-details">
        <p class="lightbox-project"></p>
        <p class="lightbox-caption" hidden></p>
        <p class="lightbox-counter" aria-live="polite"></p>
      </div>
    </div>
  `;

  document.body.append(dialog);

  const fullImage = dialog.querySelector(".lightbox-image");
  const closeButton = dialog.querySelector(".lightbox-close");
  const previousButton = dialog.querySelector(".lightbox-previous");
  const nextButton = dialog.querySelector(".lightbox-next");
  const project = dialog.querySelector(".lightbox-project");
  const counter = dialog.querySelector(".lightbox-counter");
  const caption = dialog.querySelector(".lightbox-caption");
  const hasMultipleImages = images.length > 1;
  let currentIndex = 0;

  project.textContent = projectTitle;
  previousButton.hidden = !hasMultipleImages;
  nextButton.hidden = !hasMultipleImages;

  const indexFromUrl = () => {
    const photoId = decodeURIComponent(window.location.hash.slice(1)).replace(
      /^photo-/,
      ""
    );
    return photoIds.indexOf(photoId);
  };

  const updateUrl = (index, method = "replaceState") => {
    const url = new URL(window.location.href);
    url.hash = photoIds[index];
    window.history[method](null, "", url);
  };

  const clearPhotoUrl = () => {
    if (indexFromUrl() === -1) {
      return;
    }

    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(null, "", url);
  };

  const showImage = (index) => {
    currentIndex = (index + images.length) % images.length;
    const sourceImage = images[currentIndex];

    fullImage.src = sourceImage.currentSrc || sourceImage.src;
    fullImage.alt = sourceImage.alt;
    counter.textContent = `${currentIndex + 1} / ${images.length}`;

    const captionText = sourceImage
      .closest("figure")
      ?.querySelector("figcaption")
      ?.textContent.trim() || "";
    caption.textContent = captionText;
    caption.hidden = captionText.length === 0;

  };

  const openFromUrl = () => {
    const index = indexFromUrl();

    if (index === -1) {
      if (dialog.open) {
        dialog.close();
      }
      return;
    }

    showImage(index);

    if (!dialog.open) {
      dialog.showModal();
      document.body.classList.add("lightbox-open");
    }
  };

  const moveToImage = (offset) => {
    showImage(currentIndex + offset);
    updateUrl(currentIndex);
  };

  images.forEach((image, index) => {
    const button = document.createElement("button");
    button.className = "gallery-button";
    button.type = "button";
    button.setAttribute(
      "aria-label",
      `Open ${image.alt || `photograph ${index + 1}`} fullscreen`
    );

    image.before(button);
    button.append(image);

    button.addEventListener("click", () => {
      updateUrl(index, "pushState");
      openFromUrl();
    });
  });

  closeButton.addEventListener("click", () => dialog.close());
  previousButton.addEventListener("click", () => moveToImage(-1));
  nextButton.addEventListener("click", () => moveToImage(1));

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveToImage(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveToImage(1);
    }
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
    clearPhotoUrl();
  });

  window.addEventListener("popstate", openFromUrl);
  window.addEventListener("hashchange", openFromUrl);
  openFromUrl();
})();

(() => {
  const siteShell = document.querySelector(".site-shell");
  const siteHeader = document.querySelector(".site-header");

  if (siteHeader && !siteHeader.querySelector(".site-nav")) {
    const isProjectPage = Boolean(document.querySelector(".project-title"));
    const isAboutPage = document.body.classList.contains("about-page");
    const isNestedPage = isProjectPage || isAboutPage;
    const homeHref = isNestedPage ? "../" : "./";
    const aboutHref = isProjectPage
      ? "../about/"
      : isAboutPage
        ? "./"
        : "./about/";
    const navigation = document.createElement("nav");

    navigation.className = "site-nav";
    navigation.setAttribute("aria-label", "Primary navigation");

    [
      { title: "Artwork", href: homeHref, current: !isAboutPage },
      { title: "About", href: aboutHref, current: isAboutPage }
    ].forEach((item) => {
      const link = document.createElement("a");

      link.className = "site-nav-link";
      link.href = item.href;
      link.textContent = item.title;

      if (item.current) {
        link.setAttribute("aria-current", "page");
      }

      navigation.append(link);
    });

    siteHeader.append(navigation);
  }

  if (siteShell && !siteShell.querySelector(".site-footer")) {
    const footer = document.createElement("footer");

    footer.className = "site-footer";
    footer.textContent = `© ${new Date().getFullYear()} Robert Koirala`;
    siteShell.append(footer);
  }

  const tabletQuery = window.matchMedia("(max-width: 800px)");
  const phoneQuery = window.matchMedia("(max-width: 560px)");

  const columnCount = () => {
    if (phoneQuery.matches) {
      return 1;
    }

    if (tabletQuery.matches) {
      return 2;
    }

    return 3;
  };

  const createMasonry = ({ container, itemSelector, columnGapName, rowGapName }) => {
    if (!container) {
      return;
    }

    const items = Array.from(container.querySelectorAll(itemSelector));

    if (items.length === 0) {
      return;
    }

    let layoutFrame = null;

    const layout = () => {
      layoutFrame = null;

      const columns = columnCount();
      const styles = window.getComputedStyle(container);
      const columnGap = parseFloat(styles.getPropertyValue(columnGapName));
      const rowGap = parseFloat(styles.getPropertyValue(rowGapName));
      const paddingLeft = parseFloat(styles.paddingLeft);
      const paddingRight = parseFloat(styles.paddingRight);
      const paddingBottom = parseFloat(styles.paddingBottom);
      const availableWidth = container.clientWidth - paddingLeft - paddingRight;
      const itemWidth = (availableWidth - columnGap * (columns - 1)) / columns;
      const columnHeights = Array(columns).fill(0);

      const spanFor = (item) =>
        item.classList.contains("gallery-item--wide")
          ? Math.min(2, columns)
          : 1;

      items.forEach((item) => {
        const span = spanFor(item);
        item.style.width =
          `${itemWidth * span + columnGap * (span - 1)}px`;
      });

      if (items.length === 1) {
        const item = items[0];
        const span = spanFor(item);
        const width = itemWidth * span + columnGap * (span - 1);

        item.style.left = `${paddingLeft + (availableWidth - width) / 2}px`;
        item.style.top = "0px";
        container.style.height = `${item.offsetHeight + paddingBottom}px`;
        return;
      }

      items.forEach((item) => {
        const span = spanFor(item);
        let column = 0;
        let top = Number.POSITIVE_INFINITY;

        for (let start = 0; start <= columns - span; start += 1) {
          const candidateTop = Math.max(
            ...columnHeights.slice(start, start + span)
          );

          if (candidateTop < top) {
            column = start;
            top = candidateTop;
          }
        }

        item.style.left = `${paddingLeft + column * (itemWidth + columnGap)}px`;
        item.style.top = `${top}px`;

        const nextHeight = top + item.offsetHeight + rowGap;
        for (let offset = 0; offset < span; offset += 1) {
          columnHeights[column + offset] = nextHeight;
        }
      });

      container.style.height =
        `${Math.max(...columnHeights) - rowGap + paddingBottom}px`;
    };

    const scheduleLayout = () => {
      if (layoutFrame !== null) {
        window.cancelAnimationFrame(layoutFrame);
      }

      layoutFrame = window.requestAnimationFrame(layout);
    };

    container.classList.add("is-masonry");
    container.querySelectorAll("img").forEach((image) => {
      if (!image.complete) {
        image.addEventListener("load", scheduleLayout, { once: true });
        image.addEventListener("error", scheduleLayout, { once: true });
      }
    });

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(scheduleLayout);
      items.forEach((item) => resizeObserver.observe(item));
    }

    window.addEventListener("resize", scheduleLayout);
    window.addEventListener("load", scheduleLayout, { once: true });

    if (document.fonts) {
      document.fonts.ready.then(scheduleLayout);
    }

    scheduleLayout();
  };

  createMasonry({
    container: document.querySelector(".project-grid"),
    itemSelector: ".project-card",
    columnGapName: "--project-column-gap",
    rowGapName: "--project-row-gap"
  });

  createMasonry({
    container: document.querySelector(".gallery"),
    itemSelector: "figure",
    columnGapName: "--gallery-column-gap",
    rowGapName: "--gallery-row-gap"
  });

  const gallery = document.querySelector(".gallery");

  if (!gallery) {
    return;
  }

  const slugFromUrl = (url) => {
    const segments = decodeURIComponent(url.pathname)
      .split("/")
      .filter(Boolean);

    if (segments.at(-1) === "index.html") {
      segments.pop();
    }

    return segments.at(-1) || "";
  };

  const currentSlug = slugFromUrl(window.location);
  const pagination = document.createElement("nav");
  pagination.className = "project-pagination";
  pagination.setAttribute("aria-label", "Project navigation");

  const projectLink = (project, className, relationship, accessibleLabel) => {
    const link = document.createElement("a");
    link.className = `project-pagination-link ${className}`;
    link.href = `../${project.slug}/`;
    link.rel = relationship;
    link.setAttribute("aria-label", `${accessibleLabel}: ${project.title}`);

    const name = document.createElement("span");
    name.className = "project-pagination-name";
    name.textContent = project.title;
    link.append(name);

    return link;
  };

  const renderPagination = (projects) => {
    const currentIndex = projects.findIndex(
      (project) => project.slug === currentSlug
    );

    if (currentIndex === -1 || projects.length < 2) {
      return;
    }

    const previous =
      projects[(currentIndex - 1 + projects.length) % projects.length];
    const next = projects[(currentIndex + 1) % projects.length];

    if (!pagination.isConnected) {
      gallery.insertAdjacentElement("afterend", pagination);
    }

    pagination.replaceChildren(
      projectLink(
        previous,
        "project-pagination-previous",
        "prev",
        "Previous project"
      ),
      projectLink(next, "project-pagination-next", "next", "Next project")
    );
  };

  const projectsFromHomepage = async () => {
    const indexUrl = new URL("../index.html", window.location.href);
    const response = await fetch(indexUrl, { cache: "no-cache" });

    if (!response.ok) {
      throw new Error("Could not read the homepage project order.");
    }

    const homepage = new DOMParser().parseFromString(
      await response.text(),
      "text/html"
    );

    return Array.from(
      homepage.querySelectorAll(".project-grid .project-card")
    ).map((card) => {
      const href = new URL(card.getAttribute("href"), indexUrl);
      const heading = card.querySelector("h2");

      return {
        slug: slugFromUrl(href),
        title: heading ? heading.textContent.trim() : ""
      };
    }).filter((project) => project.slug && project.title);
  };

  projectsFromHomepage()
    .then(renderPagination)
    .catch(() => {});
})();
