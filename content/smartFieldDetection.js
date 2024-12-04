export class SmartFieldDetector {
  static async analyzeFormFields() {
    const forms = document.querySelectorAll('form');
    const fields = [];
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const fieldInfo = this.analyzeField(input);
        if (fieldInfo) {
          fields.push(fieldInfo);
        }
      });
    });

    return this.categorizeFields(fields);
  }

  static analyzeField(element) {
    const attributes = {
      id: element.id,
      name: element.name,
      type: element.type,
      placeholder: element.placeholder,
      label: this.findLabel(element),
      ariaLabel: element.getAttribute('aria-label'),
      className: element.className
    };

    return {
      element,
      attributes,
      score: 0
    };
  }

  static findLabel(element) {
    // Try to find label by for attribute
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent.trim();
    }

    // Try to find parent label
    const parentLabel = element.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();

    return null;
  }

  static categorizeFields(fields) {
    const categories = {
      name: ['name', 'first', 'last', 'fname', 'lname'],
      email: ['email', 'e-mail'],
      phone: ['phone', 'mobile', 'cell', 'telephone'],
      education: ['education', 'degree', 'school', 'university'],
      experience: ['experience', 'work', 'employment', 'job']
    };

    return fields.map(field => {
      for (const [category, keywords] of Object.entries(categories)) {
        const score = this.calculateFieldScore(field, keywords);
        if (score > 0.7) {
          return { ...field, category, score };
        }
      }
      return { ...field, category: 'unknown', score: 0 };
    });
  }

  static calculateFieldScore(field, keywords) {
    let maxScore = 0;
    const text = Object.values(field.attributes)
      .filter(val => typeof val === 'string')
      .join(' ')
      .toLowerCase();

    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        maxScore = Math.max(maxScore, 0.8);
      }
    });

    return maxScore;
  }
} 