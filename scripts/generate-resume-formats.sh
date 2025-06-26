#!/bin/bash

# Generate PDF and LaTeX versions of the resume

echo "Generating resume formats..."

# Generate PDF with xelatex for better Unicode support
echo "Creating PDF version..."
pandoc docs/resume.md -o docs/resume.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=1in \
  -V documentclass=article \
  -V fontsize=11pt \
  -V mainfont="Helvetica Neue"

# Generate LaTeX source
echo "Creating LaTeX version..."
pandoc docs/resume.md -o docs/resume.tex -s

echo "Done! Generated:"
echo "  - docs/resume.pdf"
echo "  - docs/resume.tex"