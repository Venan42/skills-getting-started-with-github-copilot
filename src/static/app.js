document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const submitButton = signupForm.querySelector('button[type="submit"]');
  let isSubmitting = false;

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  function attachParticipantDeleteHandlers() {
    const deleteButtons = activitiesList.querySelectorAll(".delete-participant-btn");

    deleteButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const activity = button.dataset.activity;
        const email = button.dataset.email;

        try {
          const response = await fetch(
            `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
            {
              method: "DELETE",
            }
          );

          const result = await response.json();

          if (response.ok) {
            showMessage(result.message, "success");
            await fetchActivities();
          } else {
            showMessage(result.detail || "An error occurred", "error");
          }
        } catch (error) {
          showMessage("Failed to unregister participant.", "error");
          console.error("Error unregistering participant:", error);
        }
      });
    });
  }

  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Selecione uma atividade --</option>';

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const participants = details.participants || [];
        const spotsLeft = details.max_participants - participants.length;
        const participantsList = participants.length
          ? `<div class="participants-list">${participants
              .map(
                (participant) => `
                  <div class="participant-row">
                    <span class="participant-name">${participant}</span>
                    <button
                      type="button"
                      class="delete-participant-btn"
                      data-activity="${name}"
                      data-email="${participant}"
                      aria-label="Unregister ${participant}"
                    >
                      🗑️
                    </button>
                  </div>
                `
              )
              .join("")}</div>`
          : `<p class="empty-participants">No participants yet.</p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      attachParticipantDeleteHandlers();
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    isSubmitting = true;
    submitButton.disabled = true;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        await fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
    }
  });

  fetchActivities();
});
