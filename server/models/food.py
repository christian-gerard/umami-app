from . import SerializerMixin, validates, re, db
from sqlalchemy.ext.hybrid import hybrid_property
from config import flask_bcrypt
from datetime import datetime
import re

class Food(db.Model, SerializerMixin):
    # # # # # Table Name
    __tablename__ = 'foods'

    # # # # # Attribute
    id = db.Column(db.Integer, primary_key = True)
    
    # ADD UNIQUE CONSTRAINT TO 'NAME'
    name = db.Column(db.String(100) )
    description = db.Column(db.String)
    type_id = db.Column(db.Integer)

    # # # # # Relationship
    ingredients = db.relationship('Ingredient', back_populates='food')

    # # # # # Serialize
    serialize_rules=('-ingredients',)

    # # # # # Representation
    def __repr__(self):
        return f""" 
            <Food {self.id}
                name: {self.name}
                />
        """
    # # # # # Validate
    @validates('name')
    def validate_name(self, key, name):
        # assert name, "Name must be provided"
        return name
       
    @validates('type')
    def validate_type(self, key, type):
        types = ('fruit', 'vegetable', 'grain', 'protein', 'dairy', 'oils'  )
        assert type in types, "Type must match the types listed: fruits, vegetables... "
        return type