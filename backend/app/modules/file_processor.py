import os
import PyPDF2
import docx
from io import BytesIO
import asyncio
from typing import Dict, List
import hashlib

# Assuming hdam.py contains initialize_hdam and is in the same directory
from .hdam import initialize_hdam

class FileProcessor:
    """Process uploaded files for the PolyMathOS learning system"""
    
    def __init__(self, hdam_system):
        self.hdam = hdam_system
        
    async def process_file(self, file_content: bytes, filename: str, 
                          domains: List[str], metadata: Dict = None) -> Dict:
        """Process different file types and extract content"""
        file_extension = os.path.splitext(filename)[1].lower()
        
        content = ""
        if file_extension == '.pdf':
            content = self.extract_pdf_content(file_content)
        elif file_extension in ['.docx', '.doc']:
            content = self.extract_docx_content(file_content)
        elif file_extension == '.txt':
            content = file_content.decode('utf-8')
        else:
            # For other file types, treat as text if possible
            try:
                content = file_content.decode('utf-8', errors='ignore')
            except:
                content = f"Binary content: {filename}"
        
        # Generate unique resource ID
        resource_id = hashlib.md5(f"{filename}_{len(content)}".encode()).hexdigest()
        
        # Associate with HDAM
        # We assume hdam_system (EnhancedHDAM) has associate_resources method
        result = await self.hdam.associate_resources(
            resource_id=resource_id,
            content=content,
            domains=domains,
            metadata={
                "filename": filename,
                "file_type": file_extension,
                "content_length": len(content),
                **(metadata or {})
            }
        )
        
        return {
            "resource_id": resource_id,
            "filename": filename,
            "processed": True,
            "associated_domains": result.get("associated_domains", domains)
        }
    
    def extract_pdf_content(self, file_content: bytes) -> str:
        """Extract text content from PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Error extracting PDF content: {e}")
            return "Error processing PDF file"
    
    def extract_docx_content(self, file_content: bytes) -> str:
        """Extract text content from DOCX file"""
        try:
            doc = docx.Document(BytesIO(file_content))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except Exception as e:
            print(f"Error extracting DOCX content: {e}")
            return "Error processing Word document"

# Example usage function
async def handle_file_upload(file_bytes: bytes, filename: str, 
                           domains: List[str], user_metadata: Dict):
    """Handle file upload from web interface"""
    # This initializes a new HDAM instance, might want to pass one in instead in production
    hdam = initialize_hdam() 
    processor = FileProcessor(hdam)
    
    result = await processor.process_file(
        file_content=file_bytes,
        filename=filename,
        domains=domains,
        metadata=user_metadata
    )
    
    return result

