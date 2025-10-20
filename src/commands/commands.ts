Office.onReady(() => {
  // Office is ready
});

// Associate the action name from manifest to this handler
Office.actions.associate("onDropdownItemClick", (event) => {
  const selectedId = event.source.id;
  console.log("User selected:", selectedId);

  switch (selectedId) {
    case "option1":
      console.log("Option 1 selected");
      break;
    case "option2":
      console.log("Option 2 selected");
      break;
    case "option3":
      console.log("Option 3 selected");
      break;
  }

  event.completed(); // Important to call this
});
