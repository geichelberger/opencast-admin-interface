import React from "react";
import { useTranslation } from "react-i18next";
import { Field, Formik } from "formik";
import cn from "classnames";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import _ from "lodash";
import Notifications from "../../../shared/Notifications";
import RenderMultiField from "../../../shared/wizard/RenderMultiField";
import RenderField from "../../../shared/wizard/RenderField";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { connect } from "react-redux";
import { hasAccess, isJson } from "../../../../utils/utils";
import { getMetadataCollectionFieldName } from "../../../../utils/resourceUtils";

/**
 * This component renders metadata details of a certain event or series
 */
const DetailsMetadataTab = ({
// @ts-expect-error TS(7031): Binding element 'metadataFields' implicitly has an... Remove this comment to see the full error message
	metadataFields,
// @ts-expect-error TS(7031): Binding element 'updateResource' implicitly has an... Remove this comment to see the full error message
	updateResource,
// @ts-expect-error TS(7031): Binding element 'resourceId' implicitly has an 'an... Remove this comment to see the full error message
	resourceId,
// @ts-expect-error TS(7031): Binding element 'header' implicitly has an 'any' t... Remove this comment to see the full error message
	header,
// @ts-expect-error TS(7031): Binding element 'editAccessRole' implicitly has an... Remove this comment to see the full error message
	editAccessRole,
// @ts-expect-error TS(7031): Binding element 'user' implicitly has an 'any' typ... Remove this comment to see the full error message
	user,
}) => {
	const { t } = useTranslation();

// @ts-expect-error TS(7006): Parameter 'values' implicitly has an 'any' type.
	const handleSubmit = (values) => {
		updateResource(resourceId, values);
	};

	// set current values of metadata fields as initial values
	const getInitialValues = () => {
		let initialValues = {};

		// Transform metadata fields and their values provided by backend (saved in redux)
		if (
			!!metadataFields &&
			!!metadataFields.fields &&
			metadataFields.fields.length > 0
		) {
// @ts-expect-error TS(7006): Parameter 'field' implicitly has an 'any' type.
			metadataFields.fields.forEach((field) => {
// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
				initialValues[field.id] = field.value;
			});
		}

		return initialValues;
	};

// @ts-expect-error TS(7006): Parameter 'formik' implicitly has an 'any' type.
	const checkValidity = (formik) => {
		if (formik.dirty && formik.isValid && hasAccess(editAccessRole, user)) {
			// check if user provided values differ from initial ones
			return !_.isEqual(formik.values, formik.initialValues);
		} else {
			return false;
		}
	};

	return (
		// initialize form
		<Formik
			enableReinitialize
			initialValues={getInitialValues()}
			onSubmit={(values) => handleSubmit(values)}
		>
			{(formik) => (
				<>
					<div className="modal-content">
						<div className="modal-body">
							<Notifications context="not-corner" />
							<div className="full-col">
								<div className="obj tbl-list">
									<header className="no-expand">{t(header)}</header>
									<div className="obj-container">
										<table className="main-tbl">
											<tbody>
												{/* Render table row for each metadata field depending on type */}
												{!!metadataFields &&
													!!metadataFields.fields &&
// @ts-expect-error TS(7006): Parameter 'field' implicitly has an 'any' type.
													metadataFields.fields.map((field, key) => (
														<tr key={key}>
															<td>
																<span>{t(field.label)}</span>
																{field.required && (
																	<i className="required">*</i>
																)}
															</td>
															{field.readOnly ? (
																// non-editable field if readOnly is set
																!!field.collection &&
																field.collection.length !== 0 ? (
																	<td>
																		{isJson(
																			getMetadataCollectionFieldName(
																				field,
																				field
																			)
																		)
																			? t(
																					JSON.parse(
																						getMetadataCollectionFieldName(
																							field,
																							field
																						)
																					).label
																			  )
																			: t(
																					getMetadataCollectionFieldName(
																						field,
																						field
																					)
																			  )}
																	</td>
																) : (
																	<td>{field.value}</td>
																)
															) : (
																<td className="editable">
																	{/* Render single value or multi value editable input */}
																	{field.type === "mixed_text" &&
																	field.collection?.length !== 0 ? (
																		<Field
																			name={field.id}
																			fieldInfo={field}
																			showCheck
																			component={RenderMultiField}
																		/>
																	) : (
																		<Field
																			name={field.id}
																			metadataField={field}
																			showCheck
																			component={RenderField}
																		/>
																	)}
																</td>
															)}
														</tr>
													))}
											</tbody>
										</table>
									</div>

									{formik.dirty && (
										<>
											{/* Render buttons for updating metadata */}
											<footer style={{ padding: "15px" }}>
												<button
													type="submit"
													onClick={() => formik.handleSubmit()}
													disabled={!checkValidity(formik)}
													className={cn("submit", {
														active: checkValidity(formik),
														inactive: !checkValidity(formik),
													})}
												>
													{t("SAVE")}
												</button>
												<button
													className="cancel"
													onClick={() => formik.resetForm({ values: "" })}
												>
													{t("CANCEL")}
												</button>
											</footer>

											<div className="btm-spacer" />
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</Formik>
	);
};

// Getting state data out of redux store
// @ts-expect-error TS(7006): Parameter 'state' implicitly has an 'any' type.
const mapStateToProps = (state) => ({
	user: getUserInformation(state),
});

export default connect(mapStateToProps)(DetailsMetadataTab);
