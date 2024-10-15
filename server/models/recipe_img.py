from . import SerializerMixin, validates, re, db
from sqlalchemy.ext.hybrid import hybrid_property
from config import flask_bcrypt
from datetime import datetime
import re

class RecipeImg(db.Model, SerializerMixin):
    # # # # # Table Name
    __tablename__ = 'recipe_imgs'

    # # # # # Attribute
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String())
    img = db.Column(db.LargeBinary, nullable=False)
    mimetype = db.Column(db.String())
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'))


    # # # # # Relationship

    recipe = db.relationship('Recipe', back_populates='recipe_img')

    # # # # # Serialize
    serialize_rules=()

    # # # # # Representation
    def __repr__(self):
        return f""" 
            <Recipe_Img {self.id}
                name: {self.name}
                />
        """

    # # # # # Validate
    @validates('name')
    def validate_name(self, key, name):
        assert name, "Name must be provided"
        return name
