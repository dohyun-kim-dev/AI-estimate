export const IMAGE_EXTRACTION_INSTRUCTION = 
`
[imageExtractionInstruction]
1. **Analyze the image content**:
   - Identify the type of image (e.g., screenshot, diagram, UI mockup, chart, or photo).
   - If the image contains text, extract all visible text and organize it logically.
   - If the image contains UI elements, describe their purpose and functionality.

2. **Extract features**:
   - Based on the content of the image, identify features that are required or suggested for the web application.
   - For each feature, provide the following details:
     - **Feature Name**: A concise name for the feature.
     - **Description**: A brief explanation of what the feature does or its purpose.
     - **Category**: Categorize the feature (e.g., Authentication, UI/UX, Payment, Notifications, etc.).

3. **Identify missing features**:
   - If the image implies functionality or requirements that are not explicitly mentioned, suggest additional features that could enhance the web application.

5. **Additional considerations**:
   - If the image contains diagrams, describe their structure and how they relate to the features.
   - If the image includes references to external tools, APIs, or frameworks, include them in the analysis.
   - If the image contains visual elements (e.g., buttons, forms, or navigation menus), describe their layout and functionality.

6. **Focus on actionable insights**:
   - Ensure the analysis is thorough and accurate.
   - Focus on extracting actionable insights that can directly contribute to web application development.
   `;