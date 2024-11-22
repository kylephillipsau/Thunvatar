"use strict";

function handleError(error) {
  console.error("Thunvatar Error:", error);
  if (error.message) {
    console.error("Error message:", error.message);
  }
  if (error.stack) {
    console.error("Stack trace:", error.stack);
  }
}

async function initializeExtension() {
  try {
    console.log("Initializing Thunvatar extension...");
    await browser.ThunvatarApi.addCustomColumn();
    console.log("Thunvatar: Column added successfully");
  } catch (error) {
    handleError(error);
  }
}

// Initialize when API is available
if (typeof browser !== "undefined" && browser.ThunvatarApi) {
  initializeExtension();
}