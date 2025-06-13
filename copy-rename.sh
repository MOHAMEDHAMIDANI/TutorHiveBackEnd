#!/bin/bash
rm -rf src/post
# Prompt for the new module name
echo "Enter the new module name:"
read module_name

# Prepare name variations for replacements
singular_name_lower=$(echo "$module_name" | awk '{print tolower($0)}')
plural_name_lower="${singular_name_lower}s"
singular_name_capital="$(tr '[:lower:]' '[:upper:]' <<< ${module_name:0:1})${module_name:1}"
plural_name_capital="${singular_name_capital}s"

# Source and destination paths
source_folder="src/users"
dest_folder="src/$plural_name_lower"

# Copy the folder
cp -r "$source_folder" "$dest_folder"

# Replace inside files
find "$dest_folder" -type f -exec sed -i '' \
  -e "s/Reviews/$plural_name_capital/g" \
  -e "s/Review/$singular_name_capital/g" \
  -e "s/reviews/$plural_name_lower/g" \
  -e "s/review/$singular_name_lower/g" {} \;

# Rename files and folders
find "$dest_folder" -depth -name "*review*" -exec sh -c '
  for file; do
    mv "$file" "${file//review/'"$singular_name_lower"'}"
  done
' sh {} +

echo "Module $singular_name_lower/$plural_name_lower created and files updated with the new names."
