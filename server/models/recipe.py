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
    name = db.Column(db.String(50))
    instructions = db.Column(db.String(2000))
    category = db.Column(db.String())
    source = db.Column(db.String(50))
    prep_time = db.Column(db.String())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    # # # # # Relationship
    user = db.relationship('User', back_populates='recipes')
    ingredients = db.relationship('Ingredient', back_populates='recipe', cascade='all, delete-orphan')
    recipe_img = db.relationship('RecipeImg',uselist=False, back_populates='recipe', cascade='all, delete-orphan' )

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
        return name

    @validates('prep_time')
    def validate_name(self, key, prep_time):
        times = ('>5min', '5-30 min', '30-60 min', '1-3 hr', 'All Day')
        assert prep_time, "Prep Time must be provided"
        assert prep_time in times, "Must match approved times"
        return prep_time

    @validates('category')
    def validate_name(self, key, category):
        categories = ('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert')
        assert category, "Prep Time must be provided"
        assert category in categories, "Must match approved categories"
        return category

    @validates('source')
    def validate_name(self, key, source):
        assert source, "Prep Time must be provided"
        return source