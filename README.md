### CEEDS Visual Analytics System (CSC/SDS 235 Final Project)
# 🌱 CEEDS Visual Analytics Systems
### Exploring sustainability in Smith College dining through interactive data visualization

# Overview
### This project was developed as part of CSC/SDS 235: Visual Analytics at Smith College. We designed and implemented an interactive visual analytics system for the Center for the Environment, Ecological Design, and Sustainability (CEEDS). The goal is to help non-expert users explore sustainability-related data, particularly focusing on dining procurement and spending patterns at Smith College.

Our system enables users to better understand how dining funds are distributed across suppliers and to identify opportunities for increasing support of local and sustainable food systems.

## Domain Expert: Becca Malloy
CEEDS – Assistant Director of Sustainability

We worked with sustainability-related datasets provided through CEEDS, including dining procurement data and vendor information. The system is designed to support exploration and communication of sustainability impacts in campus dining.

Research Question:
How are dining funds distributed between local and non-local suppliers at Smith College, and what opportunities exist to shift spending toward local food systems?

# Visualizations 
This project includes three coordinated visualizations:

# 1. Sankey Diagram – Dining Spending Flow

The Sankey diagram visualizes the flow of dining funds from total spending into:

Local vs. non-local vendors
Plant-based vs. non-plant-based categories
Individual distributors

It helps reveal how money moves through the dining supply chain and highlights the proportion of spending that supports local vendors. You can hover over a flow and it will be highlighted as well as a little box will pop up with the total amount of money for that section. 

Key goals:
- Understand distribution of dining funds
- Identify opportunities to increase local procurement
- Explore sustainability-aligned spending patterns

# 2. Bar Chart 

The bar chart provides a detailed comparison of dining expenses across food categories, broken down by local vs. non-local sourcing.

Each bar represents a category (e.g., dairy, meat, produce), and is stacked to show the proportion of spending allocated to:

- Local suppliers
- Non-local suppliers

This visualization allows users to quickly assess how different categories contribute to overall spending and where local sourcing is more or less prominent. You can hover over a bar to see the total local/non-local amount for the category and the percentage of the total it is. 

Key goals:
- Compare spending across food categories
- Identify which categories rely heavily on non-local suppliers
- Highlight categories with strong local sourcing
- Support decision-making around shifting procurement toward sustainable options

# 3. Pie Chart

The pie charts visualize the breakdown of the REAL food, where Sustainable, Local, Fair, and Humane are the categories that define and contribute to what is considered real food. 

The first pie chart (left) shows the proportion of total spending that qualifies as Real vs. Not Real food, giving an overall overview of how much of the budget meets the standards. 

The second pie chart (right) breaks down the Real portion further, illustrating the distribution of the four qualifying categories. 

Key goals:
- Identify how Real food is distributed across four standards
- Understand how much of the budget is contributing toward Real food
- Support data-driven insights for improving sustainable and ethical purchasing decisions

For more information on the REAL Challenge view the RFC Guide by download the pdf as well as viewing the official [website] (https://www.rfchallenge.org/).

# Key Features:
- Multiple coordinated views (Sankey, bar chart, pie chart)
- Interactive exploration of dining fund allocation
- Details-on-demand interactions for deeper inspection of categories
- Consistent visual encoding across views for comparison
- Clean, modular structure using HTML, CSS, and JavaScript

# How to use: 
 - Download all files from main branch 
 - Open index.html with live server to view all three visualizations

# Known Bugs 
 - None as of 4/28/26

# Data Cleaning/Analysis
All of the visualizations were created using csv datasheets from CEEDS. We cleaned the totals spreadsheet by ensuring columns representing dollar amounts were parsed in as integers and added an isLocal boolean column. We also added 0 values to all cells that were blank for consistency. 


### Created by JJ Cham, Nazifa Ahmed, Bayansulu Tulepbayeva, Eva Soboleva
