document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.startViewTransition(() => {
      window.location.href = link.href;
    });
  });
});
