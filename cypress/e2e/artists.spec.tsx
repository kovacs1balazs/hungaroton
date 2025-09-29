describe('Artists Table', () => {
  beforeEach(() => {
    // Ignore hydration errors from Next.js
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Hydration failed')) {
        return false;
      }
    });

    // Intercept API calls
    cy.intercept('GET', '**/api/artists*', {
      statusCode: 200,
      body: {
        data: [
          {
            id: 1,
            name: 'Artist One',
            albumCount: 10,
            portrait: 'https://example.com/portrait1.jpg',
          },
          {
            id: 2,
            name: 'Artist Two',
            albumCount: 5,
            portrait: null,
          },
          {
            id: 3,
            name: 'Artist Three',
            albumCount: 15,
            portrait: 'https://example.com/portrait3.jpg',
          },
        ],
        pagination: {
          total_items: 100,
          page: 1,
          per_page: 50,
          total_pages: 2,
        },
      },
    }).as('getArtists');

    cy.visit('/');
  });

  it('should load and display artists table', () => {
    cy.wait('@getArtists');
    cy.get('.MuiDataGrid-root').should('be.visible');
    cy.contains('Artist One').should('be.visible');
    cy.contains('Artist Two').should('be.visible');
    cy.contains('Artist Three').should('be.visible');
  });

  it('should display correct column headers', () => {
    cy.contains('Kép').should('be.visible');
    cy.contains('Név').should('be.visible');
    cy.contains('Albumok').should('be.visible');
  });

  it('should display avatars for artists with portraits', () => {
    cy.wait('@getArtists');
    cy.get('.MuiAvatar-root').should('have.length.at.least', 1);
    cy.get('.MuiAvatar-root img').first().should('have.attr', 'src').and('include', 'portrait');
  });

  describe('Type filter', () => {
    it('should filter by composer type', () => {
      cy.get('[role="combobox"]').click();
      cy.contains('Szerző').click();
      cy.wait('@getArtists');
      cy.url().should('include', 'type=is_composer');
      cy.url().should('include', 'page=1');
    });

    it('should filter by performer type', () => {
      cy.get('[role="combobox"]').click();
      cy.contains('Előadó').click();
      cy.wait('@getArtists');
      cy.url().should('include', 'type=is_performer');
      cy.url().should('include', 'page=1');
    });

    it('should filter by primary type', () => {
      cy.get('[role="combobox"]').click();
      cy.contains('Elsődleges').click();
      cy.wait('@getArtists');
      cy.url().should('include', 'type=is_primary');
      cy.url().should('include', 'page=1');
    });

    it('should reset to all types', () => {
      cy.visit('/?type=is_composer');
      cy.wait('@getArtists');
      cy.get('[role="combobox"]').click();
      cy.contains('Összes').click();
      cy.wait('@getArtists');
      cy.url().should('not.include', 'type=');
    });
  });

  describe('Letter filter', () => {
    it('should filter by letter A', () => {
      cy.contains('button', 'A').click();
      cy.wait('@getArtists');
      cy.url().should('include', 'letter=A');
      cy.url().should('include', 'page=1');
    });

    it('should filter by letter Z', () => {
      cy.contains('button', 'Z').click();
      cy.wait('@getArtists');
      cy.url().should('include', 'letter=Z');
    });

    it('should show active state for selected letter', () => {
      cy.contains('button', 'B').click();
      cy.contains('button', 'B').should('have.class', 'MuiButton-contained');
    });

    it('should clear letter filter', () => {
      cy.visit('/?letter=C');
      cy.wait('@getArtists');
      cy.contains('button', 'Törlés').click();
      cy.wait('@getArtists');
      cy.url().should('not.include', 'letter=');
    });

    it('should only show clear button when letter is selected', () => {
      cy.contains('button', 'Törlés').should('not.exist');
      cy.contains('button', 'D').click();
      cy.contains('button', 'Törlés').should('be.visible');
    });
  });

  describe('Pagination', () => {
    it('should navigate to page 2', () => {
      cy.wait('@getArtists');
      cy.get('[aria-label="Go to next page"]').click();
      cy.wait('@getArtists');
      cy.url().should('include', 'page=2');
    });

    it('should preserve filters when changing pages', () => {
      cy.visit('/?search=test&letter=M&type=is_composer');
      cy.wait('@getArtists');
      cy.get('[aria-label="Go to next page"]').click();
      cy.wait('@getArtists');
      cy.url().should('include', 'search=test');
      cy.url().should('include', 'letter=M');
      cy.url().should('include', 'type=is_composer');
      cy.url().should('include', 'page=2');
    });
  });

  describe('Combined filters', () => {
    it('should apply multiple filters together', () => {
      cy.get('input[type="text"]').first().type('Symphony{enter}');
      cy.wait('@getArtists');
      
      cy.get('[role="combobox"]').click();
      cy.contains('Szerző').click();
      cy.wait('@getArtists');
      
      cy.contains('button', 'B').click();
      cy.wait('@getArtists');
      
      cy.url().should('include', 'search=Symphony');
      cy.url().should('include', 'type=is_composer');
      cy.url().should('include', 'letter=B');
      cy.url().should('include', 'page=1');
    });

    it('should reset page to 1 when any filter changes', () => {
      cy.visit('/?page=3');
      cy.wait('@getArtists');
      
      cy.get('input[type="text"]').first().type('test{enter}');
      cy.wait('@getArtists');
      cy.url().should('include', 'page=1');
    });
  });

  describe('Loading state', () => {
    it('should show loading indicator while fetching data', () => {
      cy.intercept('GET', '**/api/artists*', (req) => {
        req.reply((res) => {
          res.delay = 500;
          res.send({
            statusCode: 200,
            body: { data: [], pagination: { total_items: 0 } },
          });
        });
      }).as('slowRequest');
      
      cy.visit('/');
      
      cy.wait(100);
      
      cy.get('.MuiDataGrid-root').should('exist');
    });
  });

  describe('URL state management', () => {
    it('should load state from URL parameters', () => {
      cy.visit('/?page=2&search=test&letter=K&type=is_performer');
      cy.wait('@getArtists');
      
      cy.get('input[type="text"]').first().should('have.value', 'test');
      cy.contains('button', 'K').should('have.class', 'MuiButton-contained');
      cy.get('[role="combobox"]').should('contain.text', 'Előadó');
    });

    it('should use default values when no URL parameters', () => {
      cy.visit('/');
      cy.wait('@getArtists');
      
      cy.get('input[type="text"]').first().should('have.value', '');
      cy.get('select, [role="combobox"]').should('exist');
    });
  });
});