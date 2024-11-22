// api/experiments.js
"use strict";

console.log("Loading Thunvatar experiment API...");

ChromeUtils.defineESModuleGetters(this, {
  ThreadPaneColumns: "chrome://messenger/content/ThreadPaneColumns.mjs"
});

class AvatarFinder {
  constructor(email) {
    this.email = email;
  }

  getDomainFromEmail() {
    if (!this.email) return '';
    const match = this.email.match(/@(.*)/);
    if (!match || !match[1]) return '';
    const domainParts = match[1].split('.');
    if (domainParts.length < 2) return '';
    return domainParts.slice(-2).join('.');
  }

  getDomainIcon() {
    const domain = this.getDomainFromEmail();
    return "chrome://messenger/skin/icons/mail.svg";
  }
}

let columnAdded = false;

var ThunvatarApi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    console.log("Initializing Thunvatar API");
    
    return {
      ThunvatarApi: {
        async addCustomColumn() {
          if (columnAdded) {
            console.log("Column already exists, skipping...");
            return;
          }

          console.log("Adding custom column...");

          ThreadPaneColumns.addCustomColumn("thunvatarColumn", {
            name: "Domain Icon",
            sortable: true,
            flex: 0,
            width: "32px",
            isCustom: true,
            type: "image",
            properties: ["image"],
            
            // Required callbacks
            textCallback: () => "",
            getProperties: () => ["image"],
            getCellProperties: () => ["image"],
            
            // Image handling
            getImageSrc: function(msgHdr) {
              try {
                console.log("Getting image for message:", msgHdr?.messageId);
                
                if (!msgHdr?.author) {
                  console.log("No author found");
                  return "chrome://messenger/skin/icons/mail.svg";
                }

                const authorMatch = msgHdr.mime2DecodedAuthor || msgHdr.author;
                console.log("Author:", authorMatch);
                
                const emailMatch = authorMatch.match(/<(.+?)>/);
                if (!emailMatch) {
                  console.log("No email match found");
                  return "chrome://messenger/skin/icons/mail.svg";
                }

                const email = emailMatch[1].toLowerCase();
                console.log("Email found:", email);
                
                const avatarFinder = new AvatarFinder(email);
                return avatarFinder.getDomainIcon();
              } catch (ex) {
                console.error("Error in getImageSrc:", ex);
                return "chrome://messenger/skin/icons/mail.svg";
              }
            },

            // Sort handling
            getSortStringForRow: function(msgHdr) {
              try {
                const authorMatch = msgHdr.mime2DecodedAuthor || msgHdr.author;
                const emailMatch = authorMatch.match(/<(.+?)>/);
                if (!emailMatch) return "";
                const avatarFinder = new AvatarFinder(emailMatch[1].toLowerCase());
                return avatarFinder.getDomainFromEmail() || "";
              } catch (ex) {
                console.error("Error in getSortStringForRow:", ex);
                return "";
              }
            },

            // Required but unused
            cycleCell: () => {},
            isEditable: () => false
          });

          columnAdded = true;
          console.log("Custom column added successfully");
        }
      }
    };
  }

  close() {
    console.log("Cleaning up Thunvatar API");
    try {
      if (columnAdded) {
        ThreadPaneColumns.removeCustomColumn("thunvatarColumn");
        columnAdded = false;
        console.log("Custom column removed successfully");
      }
    } catch (ex) {
      console.error("Error removing column:", ex);
    }
  }
};