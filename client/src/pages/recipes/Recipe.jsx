import { useContext, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFormik, FieldArray, Formik, Field } from "formik";
import toast from "react-hot-toast";
import { object, string, array, number } from "yup";
import { date as yupDate } from "yup";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import RecipeForm from "../recipes/RecipeForm";
import Nav from "../../components/Nav";
import { useDropzone} from 'react-dropzone'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


function Recipe({ id, name, steps, ingredients, category, prep_time, source, recipe_img, cookbooks }) {

  const { user, updateRecipes } = useContext(UserContext);

  const route = useParams();
  const nav = useNavigate();
  const {getRootProps, getInputProps} = useDropzone();

  const [editMode, setEditMode] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState({});
  const [files, setFiles] = useState([]);

  const handleEdit = () => {
    setEditMode(!editMode);
  };

  const handleDelete = () => {

    fetch(`/recipes/${route.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          const newRecipes = user.recipes.filter(
            (recipe) => recipe.id !== currentRecipe.id,
          );
          updateRecipes(newRecipes);
          nav("/cookbook");
          toast.success("Deleted");
        } else {
          return res.json().then((errorObj) => toast.error(errorObj.message));
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const recipeSchema = object({
    name: string(),
    steps: string(),
    ingredients: array().of(
      object().shape({
        name: string(),
        amount: number(),
        measurement: string(),
      }),
    ),
  });

  const initialValues = {
    name: "",
    steps: "",
    category: "",
    source: "",
    prep_time: "",
    ingredients: [
      {
        name: "",
        amount: "",
        measurement_unit: "",
      }
    ]
  };

  const formik = useFormik({
    initialValues,
    validationSchema: recipeSchema,
    onSubmit: (formData) => {

      formData['ingredients'] = JSON.stringify(formData['ingredients'])

      const fd = new FormData()

      fd.set("image_file", files[0])

      for(let key in formData) { fd.set(key, formData[key])}

      fetch(`/recipes/${currentRecipe.id}`, {
        method: "PATCH",
        body: fd,
      }).then((res) => {
        if (res.ok) {
          return res.json().then((data) => {
            console.log(data)
            const updatedRecipes = user.recipes.map((recipe) => recipe.id === currentRecipe.id ? data : recipe)
            updateRecipes(updatedRecipes)
            handleEdit()
            toast.success("Recipe Updated");
          });
        } else {
          return res.json().then((errorObj) => toast.error(errorObj.message));
        }
      });
    },
  });

  useEffect(() => {
    if (route.id) {
      fetch(`/recipes/${route.id}`).then((res) => {
        if (res.ok) {
          res
            .json()
            .then((data) => {
              console.log(data)
              setCurrentRecipe(data);
              formik.setValues({
                name: data.name,
                steps: data.steps,
                category: data.category,
                source: data.source,
                prep_time: data.prep_time,
                ingredients: data.ingredients.map((ingredient) => ({
                  name: ingredient.food.name,
                  amount: ingredient.amount,
                  measurement_unit: ingredient.measurement_unit
                }))
              });
            })
        } else if (res.status === 422) {
          toast.error("Invalid Login");
        } else {
          return res.json().then((errorObj) => toast.error(errorObj.Error));
        }
      });
    }
  }, [route.id, editMode]);

  const removeFile = (name) => {
    setFiles(files => files.filter(file => file.name !== name ))
  }

  return (
    <>

      {route.id ?

        // Recipe Page
        <div>
          <div className='bg-champagne p-6 m-2 rounded-lg flex flex-col m-6'>
            <div className='flex justify-between mb-8'>
              <button
                  className=" border rounded-lg p-2 m-2 text-black w-[75px]"
                  onClick={ () => nav('/cookbook')}
                >
                  <ArrowBackIcon/>
                  Back
                </button>

                <div className='flex flex-row'>

                  <button
                    className="bg-shittake rounded-lg p-2 m-2 text-white w-[100px] flex items-center"
                    onClick={handleEdit}
                  >
                    <EditIcon className='mr-1'/>
                    EDIT
                  </button>
                  <button
                    className="bg-white rounded-lg p-2 m-2 text-shittake w-[100px] flex items-center"
                    onClick={handleDelete}
                  >
                    <DeleteIcon className='mr-1'/>
                    DELETE
                  </button>

                </div>

            </div>

            <div className='flex flex-row justify-between'>

              <div>

                <p className="text-6xl bold mb-6 tracking-wide ">{currentRecipe.name}</p>
                <img alt='recipe_img' src={ currentRecipe.recipe_img ? `data:${currentRecipe.recipe_img.mimetype};base64,${currentRecipe.recipe_img.img}` : recipeimgHolder } className='w-[400px] h-[400px] ml-8 rounded-2xl'/>

              </div>


              <div className='mt-16 text-xl'>
                <h1 className='text-4xl bold mb-4'>Details</h1>
                <p className='mb-6'>Category: {currentRecipe.category}</p>
                <p className='mb-6'>Source: {currentRecipe.source}</p>
                <p className='mb-6'>Prep Time: {currentRecipe.prep_time}</p>
              </div>


              <div className='flex flex-col mt-16 text-2xl'>

                <h1 className='text-4xl bold mb-4'>Ingredients</h1>
                  {currentRecipe.ingredients ? (
                    <ul>
                      {currentRecipe.ingredients.map((ingredient) => (
                        <li>
                          {ingredient.food.name} {ingredient.amount}{" "}
                          {ingredient.measurement_unit}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No Ingredients</p>
                  )}



              </div>

              <div className='w-[30%] p-2 mt-16'>

                <h1 className='text-4xl bold mb-4'>Instructions</h1>
                <p className="text-lg">{currentRecipe.steps}</p>



              </div>


            </div>


          </div>










          {editMode ? (
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
                          onClick={handleEdit}
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
                          Update Recipe
                        </button>

                      </form>
                    </Formik>
                    </div>
          ) : (
            <></>
          )}
        </div>

        :

        // Recipe Card
        <NavLink to={`/recipes/${id}`} className='sm:w-[350px]'>
          <div className=" border bg-champagne rounded-lg p-2 flex flex-row">
            <div className='w-[60%] text-md overflow-hidden'>
              <p className="text-2xl pb-[0.25px]">{name ? name : ""}</p>
              <p className=''>Category: {category ? category[0].toUpperCase() : ""}{category ? category.substring(1) : "None"}</p>
              <p className=''>Source: {source ? source[0].toUpperCase() : ""}{source ? source.substring(1) : "None"}</p>
              <p className=''>Prep Time: {prep_time ? prep_time[0].toUpperCase() : ""}{prep_time ? prep_time.substring(1) : "None"}</p>
              <p className=''>Ingredients: {ingredients && ingredients.length !== 0 ? ingredients.length : "None"}</p>
            </div>
            <div className='w-[40%] flex justify-center items-center'>
              <img src={ recipe_img ? `data:${recipe_img.mimetype};base64,${recipe_img.img}` : '../public/umami.png' } alt='recipeimagedetails' className='w-[120px] h-[120px] sm:w-[120px] sm:h-[120px] border rounded-2xl'/>
            </div>
          </div>
        </NavLink>

      }

    </>
  )
}

export default Recipe;