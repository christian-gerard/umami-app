import Recipe from "./Recipe";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context/UserContext";
import { useFormik, Field, FieldArray, Formik } from "formik";
import toast from "react-hot-toast";
import { object, string, array, number } from "yup";
import { useDropzone} from 'react-dropzone'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


function Cookbook() {
  const nav = useNavigate();
  const { user, updateRecipes } = useContext(UserContext);
  const [pages, setPages] = useState(1);
  const [recipeForm, setRecipeForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * 10;
  const endIndex = currentPage * 10;
  const [files, setFiles] = useState([]);
  const {getRootProps, getInputProps} = useDropzone();

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((currentPage) => currentPage - 1);
    }
  };

  const handleNext = () => {
    if (pages > currentPage) {
      setCurrentPage((currentPage) => currentPage + 1);
    }
  };

  const newRecipe = () => {
    setRecipeForm(!recipeForm);
  };

  const recipeSchema = object({
    name: string()
    .required(),
    steps: string()
    .required(),
    source: string()
    .required(),
    category: string()
    .required()
    .oneOf(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']),
    prep_time: string()
    .required(),
    ingredients: array().of(
      object({
        name: string()
        .required(),
        amount: number(),
        measurement_unit: string(),
      }),
    ),
  });

  const initialValues = {
    name: "",
    steps: "",
    category: "",
    prep_time: "",
    source: "",
    ingredients: [
      {
        name: "",
        amount: "",
        measurement_unit: "",
      }
    ],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: recipeSchema,
    onSubmit: (formData) => {

      formData['ingredients'] = JSON.stringify(formData['ingredients'])

      const fd = new FormData()

      fd.set("image_file", files[0])

      for(let key in formData) { fd.set(key, formData[key])}



      fetch("/recipes", {
        method: "POST",
        body: fd,
      }).then((res) => {
        if (res.ok) {
          return res.json().then((data) => {
            updateRecipes([...user.recipes, data])
            newRecipe();
            nav("/cookbook");
            toast.success("Recipe Created");
          });
        } else {

          return res.json().then((data) => {


            const message = data.Error
            toast.error(message)
          })
        }
      });






    },
  });

  const removeFile = (name) => {
    setFiles(files => files.filter(file => file.name !== name ))
  }


  useEffect(() => {
    user ? (
      setPages((pages) => Math.ceil(user.recipes.length / 10))
    ) : (
      <h1>Loading</h1>
    );
  }, [user]);


  return (
    <div className="p-6 mt-6 ">
      <div className="flex flex-col flex-grow ">
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl sm:text-5xl tracking-widest">My Cookbook</h1>


          <button
            className="text-[1em] flex-nowrap sm:text-lg bg-shittake hover:text-black rounded-lg p-2 text-white "
            onClick={newRecipe}
          >
            New Recipe +
          </button>
        </div>

        <div className=" mt-10 rounded-xl text-white flex flex-wrap align-center ">
          {user ? (
            user.recipes
              .slice(startIndex, endIndex)
              .map((recipe) => <Recipe key={recipe.id} {...recipe} />)
          ) : (
            <h1>LOADING</h1>
          )}
        </div>

        <div className=" text-xl flex justify-center pb-6 pt-6">
          <button className="bg-champagne p-1 rounded-lg" onClick={handlePrev}>
            <ArrowBackIcon />
          </button>
          <div className="text-xl">
            &nbsp;{currentPage} of {pages}&nbsp;
          </div>{" "}
          &nbsp;
          <button className="bg-champagne p-1 rounded-lg" onClick={handleNext}>
            <ArrowForwardIcon />
          </button>
        </div>
      </div>

      {recipeForm ? (
        <div className="fixed inset-0 flex justify-center items-center transition-colors backdrop-blur">
        <Formik
          onSubmit={formik.handleSubmit}
          initialValues={initialValues}
          className=""
        >
          <form
            onSubmit={formik.handleSubmit}
            className="bg-white border border-shittake rounded-lg p-2"
          >
            <button
              className="bg-shittake text-white rounded-xl mb-6 flex justify-center w-full "
              type="button"
              onClick={newRecipe}
            >
              X
            </button>

            <div className='flex flex-row'>

              <div className="flex flex-col mr-3">
                <div className='flex flex-row'>

                  <label htmlFor="name">
                    Name
                  </label>

                  {formik.errors.name && formik.touched.name && (
                    <div className="text-shittake pr-2 pl-2 cormorant-garamond-bold"> **{formik.errors.name.toUpperCase()}</div>
                  )}

                </div>
                <input
                  type="text"
                  name="name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.name}
                  className="border p-1 m-1 rounded-lg"
                  placeholder="Recipe Name"
                />

                <div className='flex flex-row'>

                  <label htmlFor="category">
                    Category
                  </label>

                  {formik.errors.category && formik.touched.category && (
                    <div className="text-shittake pr-2 pl-2 cormorant-garamond-bold"> **{formik.errors.category.toUpperCase()}</div>
                  )}

                </div>

                <select
                  as='select'
                  name="category"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.category}
                  className="border p-1 m-1 rounded-lg"
                  placeholder="Category"
                >
                  <option value='' className='bold italic'>Select Category</option>
                  <option value='breakfast'>Breakfast</option>
                  <option value='lunch'>Lunch</option>
                  <option value='dinner'>Dinner</option>
                  <option value='snack'>Snack</option>
                  <option value='dessert'>Dessert</option>
                </select>

                <div className='flex flex-row'>

                  <label htmlFor="ingredients">
                    Ingredients
                  </label>

                </div>

                <FieldArray name="ingredients" validateOnChange={true}>
                  {(fieldArrayProps) => {
                    const { push, remove, form } = fieldArrayProps;
                    const { values } = form;
                    const ingredients = values.ingredients || [];

                    const handleAddIngredient = () => {
                      push({ name: "", amount: "", measurement_unit: "" });
                    };

                    const handleDeleteIngredient = (index) => {

                      if (index !== 0) {

                        remove(index)
                        const updatedIngredients = [...formik.values.ingredients]
                        updatedIngredients.splice(index, 1)
                        formik.setFieldValue('ingredients',updatedIngredients)

                      }

                    }

                    return (
                      <div>
                        {ingredients.map((ingredient, index) => (
                          <div key={index} className="text-black">
                            <Field
                              name={`ingredients[${index}].name`}
                              value={
                                formik.values.ingredients[index]
                                  ? formik.values.ingredients[index].name
                                  : ""
                              }
                              onChange={formik.handleChange}
                              placeholder="Name"
                              className="m-1 p-1 border rounded-lg w-[250px]"
                            />

                            <Field
                              name={`ingredients[${index}].amount`}
                              placeholder="#"
                              value={
                                formik.values.ingredients[index]
                                  ? formik.values.ingredients[index].amount
                                  : ""
                              }
                              onChange={formik.handleChange}
                              className="m-1 p-1 border rounded-lg w-[40px]"
                            />
                            <Field
                              as='select'
                              name={`ingredients[${index}].measurement_unit`}
                              placeholder="Unit"
                              value={
                                formik.values.ingredients[index]
                                  ? formik.values.ingredients[index].measurement_unit
                                  : ""
                              }
                              onChange={formik.handleChange}
                              className="m-1 p-1 border rounded-lg w-[120px]"
                            >
                              <option value=''>Measur.</option>
                              <option value='pint'>Pint</option>
                              <option value='quart'>Quart</option>
                              <option value='cups'>Cup</option>
                              <option value='oz'>Ounce</option>
                              <option value='fl oz'>Fluid Ounce</option>
                              <option value='tbsp'>Tablespoon</option>
                              <option value='tsp'>Teaspoon</option>

                            </Field>

                            <button
                              type="button"
                              onClick={() => handleDeleteIngredient(index)}
                              className="p-1 m-1 w-[30px] bg-champagne text-black rounded-lg"
                            >
                              <RemoveIcon />
                            </button>
                            <button
                              type="button"
                              onClick={handleAddIngredient}
                              className="p-1 m-1 w-[30px] bg-champagne text-black rounded-lg"
                            >
                              <AddIcon />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                </FieldArray>
              </div>

              <div className="flex flex-col  align-top ml-3">

              <div className='flex flex-row'>

                <label htmlFor="prep_time">
                  Prep Time
                </label>

                {formik.errors.prep_time && formik.touched.prep_time && (
                  <div className="text-shittake pr-2 pl-2 cormorant-garamond-bold"> **{formik.errors.prep_time.toUpperCase()}</div>
                )}

              </div>

                <select
                  as='select'
                  name="prep_time"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.prep_time}
                  className="border p-1 m-1 rounded-lg"
                  placeholder="Prep time"
                >
                  <option value=''>Select Prep Time</option>
                  <option value='10 min'>  less than 5 min</option>
                  <option value='10 min'>  5 - 10 min</option>
                  <option value='10 min'>  10 - 20 min</option>
                  <option value='10 min'>  20 - 30 min</option>
                  <option value='10 min'>  20 - 30 min</option>
                </select>

                <div className='flex flex-row'>

                  <label htmlFor="source">
                    Source
                  </label>

                  {formik.errors.source && formik.touched.source && (
                    <div className="text-shittake pr-2 pl-2 cormorant-garamond-bold"> **{formik.errors.source.toUpperCase()}</div>
                  )}

                </div>
                <input
                  type="text"
                  name="source"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.source}
                  className="border p-1 m-1 rounded-lg"
                  placeholder="Where did you find this recipe?"
                />


                <div className='flex flex-row'>

                  <label htmlFor="recipe_img">
                    Recipe Image
                  </label>

                  {formik.errors.source && formik.touched.source && (
                    <div className="text-shittake pr-2 pl-2 cormorant-garamond-bold"> **{formik.errors.source.toUpperCase()}</div>
                  )}

                </div>

                <div  {...getRootProps({className: 'dropzone'})}>
                  <input {...getInputProps()} />
                  <p className='bg-shittake border text-white p-2 rounded-lg'>

                    <UploadFileIcon />
                    Drag or Click Here

                    </p>
                </div>

                  {files[0] ?
                  <div className='flex flex-row justify-between bg-champagne p-2 m-2 rounded-lg '>

                    <div clasName='flex flex-row'>
                      <img alt='img_preview' src={files[0].preview} className='h-[50px] w-[50px]' />

                      <div className='flex flex-col'>

                        <p>{files[0].name}</p>
                        <p>{files[0].size}</p>

                      </div>

                    </div>


                    <div className='flex flex-col'>

                      <button
                        className='bg-shittake text-white rounded-lg p-1'
                        onClick={() => removeFile(files[0].name)}
                      >
                        Remove
                      </button>

                    </div>

                  </div>
                  :
                  <h1>No file Uploaded</h1>}


                <div className='flex flex-row'>

                  <label htmlFor="instructions">
                    Instructions
                  </label>

                  {formik.errors.steps && formik.touched.steps && (
                    <div className="text-shittake pr-2 pl-2 cormorant-garamond-bold"> **{formik.errors.steps.toUpperCase()}</div>
                  )}

                </div>

                <textarea
                  name="steps"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.steps}
                  className="resize-none border rounded-lg overflow-y-auto w-[600px] h-[200px] m-1 p-1"
                  placeholder="Instructions for recipe (include any helpful tips as well!)"
                />






              </div>

            </div>

            <button type ='submit' className="text-lg bg-shittake text-white hover:bg-transparent rounded-lg w-full mt-6">
              Add Recipe
            </button>

          </form>
        </Formik>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Cookbook;