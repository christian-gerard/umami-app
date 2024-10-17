from . import SerializerMixin, validates, re, db
from sqlalchemy.ext.hybrid import hybrid_property
from config import flask_bcrypt
from datetime import datetime
import re

class Recipe(db.Model, SerializerMixin):
    # # # # # Table Name
    __tablename__ = 'recipes'

    # # # # # Attribute
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(20))
    steps = db.Column(db.String())
    category = db.Column(db.String())
    source = db.Column(db.String())
    prep_time = db.Column(db.String())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    # # # # # Relationship
    user = db.relationship('User', back_populates='recipes')
    ingredients = db.relationship('Ingredient', back_populates='recipe', cascade='all, delete-orphan')
    # recipe_img = db.relationship('RecipeImg',uselist=False, back_populates='recipe', cascade='all, delete-orphan' )

    # # # # # Serialize
    serialize_rules=('-user')

    # # # # # Representation
    def __repr__(self):
        return f"""
            <Recipe {self.id}
                name: {self.name}
                created_at: {self.created_at}
                />
        """

    # # # # # Validate
    @validates('name')
    def validate_name(self, key, name):
        assert name, "Name must be provided"
        assert len(name) < 51, "Name must not be over 50 characters "
        return name

    @validates('steps')
    def validate_steps(self, key, steps):
        assert steps, "Steps must be provided"
        assert len(steps) > 10, "Steps must be at least 10 characters"
        return steps