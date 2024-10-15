from . import SerializerMixin, validates, re, db
from sqlalchemy.ext.hybrid import hybrid_property
from config import flask_bcrypt
from datetime import datetime
import re

class Cookbook(db.Model, SerializerMixin):
    # # # # # Table Name
    __tablename__ = 'cookbooks'

    # # # # # Attribute
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(20), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'))
    created_at = db.Column(db.DateTime, default=datetime.now())

    # # # # # Relationship
    user = db.relationship('User', back_populates='cookbooks')
    recipe = db.relationship('Recipe', back_populates='cookbooks')

    # # # # # Serialize
    serialize_rules = ('-user','-recipe')

    # # # # # Representation
    def __repr__(self):
        return f""" 
            <CookBook {self.id}
                name: {self.name}
                created_at: {self.created_at}
                />
        """

    # # # # # Validate
    @validates('name')
    def validate_name(self, key, name):
        assert len(name) > 0, "Must provide a name"
        return name

    @validates('user_id')
    def validate_user_id(self, key, user_id):
        assert user_id, "Must include user_id"
        assert user_id > 0, "User_id must be a valid integer"
        return user_id
    
    @validates('recipe_id')
    def validate_recipe_id(self, key, recipe_id):
        assert recipe_id, "Must include recipe_id"
        assert recipe_id > 0, "Recipe_id must be a valid integer"
        return recipe_id


