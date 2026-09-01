# Project Guard AI

creata a rBuild a clean, modern AI-powered Infrastructure Project Risk Monitoring web application for the SIH 26103 / MoSPI PAIMANA project.

Create a Projects Risk page with four prominent clickable risk category cards/tabs:

🔴 Critical
🟠 High
🟡 Medium
🟢 Low

Each category should show the number of projects in that category. When the user clicks a category, filter the page to display only projects belonging to that risk level.

Below this, display a professional, searchable and sortable projects table with:

Project Name

Sector

Predicted Cost Overrun

Predicted Time Overrun

Implementation Risk Score

Risk Category

Make every project row clickable.

When a project is clicked, open a separate Project Intelligence / Project Details page.

The project details page should clearly display:

Project Information

Project Name

Project Code

Sector

Line Ministry / Department

Implementing Agency

Cost Intelligence

Original Approved Cost

Latest Revised Cost

Cumulative Expenditure

Predicted Final Cost

Predicted Cost Overrun

Timeline Intelligence

Project Start Date

Original Completion Date

Latest Revised Completion Date

AI Predicted Completion Date

Predicted Time Overrun

Progress & Risk

Physical Progress %

Implementation Risk Score out of 100

Risk Category: Critical / High / Medium / Low

AI Risk Intelligence

Add a prominent section called “Why is this project at risk?” showing:

Top contributing factors

Possible reasons for cost escalation

Possible reasons for time delay

Early warning signals

Project performance compared with similar projects in the same sector

Use clear data visualisation for cost journey, project timeline and risk indicators. The AI explanations should look like actionable government decision-support insights, not generic text.

Use a professional government-tech / enterprise analytics design. Keep the interface clean, data-focused and premium. Use a responsive layout.

Do NOT keep the sidebar permanently open. Keep it collapsed by default and open it only when the user clicks a compact menu/two-dot or menu icon. Include Dashboard and Projects navigation.

Make all risk categories, table rows and project details properly interactive with realistic sample data and smooth navigation.andom website

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://risk-watch-gov.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e5fcf5fb-84f0-4fa0-821e-34dce62121dc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
